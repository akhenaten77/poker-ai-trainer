"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GameState } from "../../engine/game";
import { PokerAI } from "../../engine/ai";
import { PokerEvaluator } from "../../engine/evaluator";
import { Card } from "../../engine/deck";

// ─── HAND CATEGORIZATION ENGINE ─────────────────────────────────────────────
// Deterministic preflop hand classification. Runs BEFORE the LLM call so the
// model never has to guess hand categories from raw card strings.

type HandCategory =
  | 'premium_pair'    // AA, KK, QQ
  | 'strong_pair'     // JJ–88
  | 'weak_pair'       // 77–22
  | 'strong_broadway'  // AK, AQ, AJ, KQ (suited or offsuit)
  | 'weak_broadway'    // KJ, QJ, JT (suited or offsuit)
  | 'suited_connector' // e.g. 76s, 98s (gap ≤ 2)
  | 'suited_ace'       // A2s–A9s
  | 'offsuit_ace'      // A2o–A9o
  | 'trash';

function classifyHand(cards: Card[]): { category: HandCategory; label: string; isSuited: boolean } {
  if (!cards || cards.length !== 2) return { category: 'trash', label: 'Unknown', isSuited: false };

  const rankOrder = '23456789TJQKA';
  const r1 = rankOrder.indexOf(cards[0].rank);
  const r2 = rankOrder.indexOf(cards[1].rank);
  const high = Math.max(r1, r2);
  const low = Math.min(r1, r2);
  const isSuited = cards[0].suit === cards[1].suit;
  const isPair = r1 === r2;
  const gap = high - low;
  const highRank = rankOrder[high];
  const lowRank = rankOrder[low];
  const suitLabel = isSuited ? 's' : 'o';
  const label = isPair ? `${highRank}${highRank}` : `${highRank}${lowRank}${suitLabel}`;

  // Pairs
  if (isPair) {
    if (high >= 10) return { category: 'premium_pair', label, isSuited };   // QQ, KK, AA
    if (high >= 6)  return { category: 'strong_pair', label, isSuited };     // 88–JJ
    return { category: 'weak_pair', label, isSuited };                       // 22–77
  }

  const isBroadway = (idx: number) => idx >= 8; // T, J, Q, K, A

  // Strong broadways: AK, AQ, AJ, KQ
  if (isBroadway(high) && isBroadway(low)) {
    if ((highRank === 'A' && ['K', 'Q', 'J'].includes(lowRank)) || (highRank === 'K' && lowRank === 'Q')) {
      return { category: 'strong_broadway', label, isSuited };
    }
    // Weak broadways: KJ, QJ, JT, KT, QT
    return { category: 'weak_broadway', label, isSuited };
  }

  // Suited Aces (non-broadway kicker)
  if (highRank === 'A' && isSuited) return { category: 'suited_ace', label, isSuited };
  if (highRank === 'A' && !isSuited) return { category: 'offsuit_ace', label, isSuited };

  // Suited connectors / gappers (gap ≤ 2, both cards 5+)
  if (isSuited && gap <= 2 && low >= 3) return { category: 'suited_connector', label, isSuited };

  return { category: 'trash', label, isSuited };
}

function getPositionContext(position: string): 'early' | 'middle' | 'late' {
  if (['UTG'].includes(position)) return 'early';
  if (['MP', 'SB', 'BB'].includes(position)) return 'middle';
  return 'late'; // BTN, CO
}

function getStackDepthLabel(stackBB: number): string {
  if (stackBB >= 100) return 'deep (100BB+)';
  if (stackBB >= 50) return 'medium (50-100BB)';
  if (stackBB >= 20) return 'short (20-50BB)';
  return 'very short (<20BB)';
}

const API_KEY = process.env.GEMINI_API_KEY || "";

const MODEL_HIERARCHY = [
  "models/gemma-3-27b-it",
  "models/gemini-3.1-flash-lite-preview",
  "models/gemini-2.5-flash-lite",
  "models/gemini-2.5-flash"
];

// Initialize the AI client
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

async function callGemini(
  prompt: string, 
  options: { responseMimeType?: string; maxOutputTokens?: number; temperature?: number }
): Promise<string | null> {
  if (!genAI) {
    console.error("Gemini API not initialized (missing API key)");
    return null;
  }

  for (const modelId of MODEL_HIERARCHY) {
    try {
      const fullModelId = modelId.startsWith('models/') ? modelId : `models/${modelId}`;
      const model = genAI.getGenerativeModel({ model: fullModelId });
      
      console.log(`AI Attempt [${modelId}]...`);
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: options.responseMimeType,
          maxOutputTokens: options.maxOutputTokens,
          temperature: options.temperature,
        }
      });
      const response = await result.response;
      const text = response.text();
      
      if (text) {
        console.log(`AI Success [${modelId}]`);
        return text;
      }
    } catch (error: any) {
      console.warn(`Model [${modelId}] failed/unavailable:`, error.message);
    }
  }

  return null;
}

function buildCompressedGameState(state: GameState, heroId?: string) {
  const gameStageMap: Record<string, string> = {
    'PREFLOP': 'preflop',
    'FLOP': 'flop',
    'TURN': 'turn',
    'RIVER': 'river',
    'SHOWDOWN': 'river'
  };
  
  const stage = gameStageMap[state.currentRound] || 'preflop';
  
  // Dynamic Trimming
  let actionHistory = [...state.handHistory];
  if (stage === 'preflop') {
    actionHistory = actionHistory.slice(-8); // last 6-8 actions preflop
  } else {
    actionHistory = actionHistory.slice(-6); // last ~4-6 actions postflop
  }

  const activePlayers = state.players.filter(p => !p.hasFolded);
  const isMultiway = activePlayers.length > 2;

  // Effective stack: smallest stack among active players (or 0 if none)
  const stacks = activePlayers.map(p => p.stack);
  stacks.sort((a, b) => a - b);
  const effectiveStack = stacks.length >= 2 ? stacks[0] : (stacks[0] || 0);

  const heroIndex = state.players.findIndex(p => p.id === (heroId || 'hero'));
  const heroPlayer = state.players[heroIndex] || state.players[0];

  const toCall = state.currentHighestBet - heroPlayer.currentBet;
  const potOdds = toCall > 0 ? (toCall / (state.pot + toCall)) : 0;
  const stackToPotRatio = state.pot > 0 ? (effectiveStack / state.pot) : 0;

  // Derive Positions
  const getPosition = (index: number) => {
    if (state.players.length === 2) {
      return index === state.dealerIndex ? 'BTN' : 'BB';
    }
    if (index === state.dealerIndex) return 'BTN';
    if (index === (state.dealerIndex + 1) % state.players.length) return 'SB';
    if (index === (state.dealerIndex + 2) % state.players.length) return 'BB';
    if (index === (state.dealerIndex + 3) % state.players.length) return 'UTG';
    return 'MP'; 
  };

  const payload = {
    game_stage: stage,
    pot_size: state.pot,
    current_bet: state.currentHighestBet,
    players: state.players.map((p, i) => ({
      id: p.id,
      stack: p.stack,
      position: getPosition(i),
      has_folded: p.hasFolded,
      is_all_in: p.isAllIn,
      last_bet_size: p.currentBet,
      last_action: p.hasFolded ? "fold" : p.isAllIn ? "all-in" : (p.currentBet > 0 ? "bet/call" : "check") // Approximate if no specific action tracked
    })),
    hero: {
      cards: heroPlayer.cards.map(c => c.rank + c.suit.charAt(0)),
      stack: heroPlayer.stack,
      position: getPosition(heroIndex)
    },
    community_cards: state.communityCards.map(c => c.rank + c.suit.charAt(0)),
    action_history: actionHistory,
    num_active_players: activePlayers.length,
    table_type: "cash",
    blinds: {
      small_blind: 0.5,
      big_blind: 1
    },
    derived_features: {
      pot_odds: parseFloat(potOdds.toFixed(2)),
      effective_stack: effectiveStack,
      stack_to_pot_ratio: parseFloat(stackToPotRatio.toFixed(2)),
      is_multiway: isMultiway
    }
  };

  return JSON.stringify(payload, null, 2);
}

export async function getBotDecision(
  state: GameState,
  botIndex: number
): Promise<{ action: 'FOLD' | 'CHECK' | 'CALL' | 'RAISE'; amount?: number }> {
  const bot = state.players[botIndex];
  if (!bot || !bot.isBot) return { action: "CHECK" };

  const toCall = state.currentHighestBet - bot.currentBet;
  
  const botProfiles = {
    'Easy': {
      "style": "balanced",
      "bluff_frequency": 0.4,
      "fold_threshold": "low",
      "risk_tolerance": "high"
    },
    'Medium': {
      "style": "tight",
      "bluff_frequency": 0.1,
      "fold_threshold": "high",
      "risk_tolerance": "low"
    },
    'Hard': {
      "style": "aggressive",
      "bluff_frequency": 0.2,
      "fold_threshold": "medium",
      "risk_tolerance": "controlled"
    }
  };

  const profile = botProfiles[state.difficulty as keyof typeof botProfiles] || botProfiles.Medium;
  const gameStateJson = buildCompressedGameState(state, bot.id);

  const prompt = `System Instruction:
You are a professional poker player making a decision in a real game.

Goals:
- Make the MOST +EV practical move
- Avoid unnecessary complexity or GTO jargon
- Adapt to multi-player pots (not heads-up only)
- Consider position, pot odds, and player count
- You are acting as the player identified as "hero" in the state

Bot Profile (Adhere to this style):
${JSON.stringify(profile, null, 2)}

Game State Snapshot:
${gameStateJson}

Output STRICTLY in JSON:
{
  "action": "fold | call | raise | check | bet",
  "bet_size": number,
  "reason": "Short, clear explanation in simple language (max 2 sentences)"
}

Rules:
- NO theory explanations
- NO long reasoning
- NO disclaimers
- Be decisive`;

  try {
    const text = await callGemini(prompt, {
      responseMimeType: "application/json",
      maxOutputTokens: 200,
      temperature: 0.2,
    });

    if (text) {
      console.log(`AI Success - BOT DECISION`);
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
         const json = JSON.parse(jsonMatch[0]);
         
         if (json.action.toUpperCase() === "BET") json.action = "RAISE";
         json.action = json.action.toUpperCase();

         if (json.action === "CALL" && toCall === 0) json.action = "CHECK";
         if (json.action === "CHECK" && toCall > 0) json.action = "FOLD";
         if (json.action === "RAISE") {
           const minTotal = state.currentHighestBet + state.minRaise;
           json.amount = json.bet_size || minTotal;
           if (json.amount < minTotal) json.amount = minTotal;
           const maxPossible = bot.stack + bot.currentBet;
           if (json.amount > maxPossible) json.amount = maxPossible;
         } else {
             delete json.amount;
         }
         return { action: json.action, amount: json.amount };
      }
    }
  } catch (error: any) {
    console.error(`Gemini Bot Decision Error:`, error.message);
  }

  console.log("FALLBACK: Using local PokerAI engine for bot decision.");
  return PokerAI.decideAction(state, botIndex);
}

// ─── COACHING CONTEXT BUILDER ────────────────────────────────────────────────
// Builds a rich, pre-computed coaching context so the LLM receives everything
// it needs to give sharp, non-generic advice without hallucinating.

interface CoachingContext {
  isPreflop: boolean;
  handCategory: HandCategory;
  handLabel: string;
  isSuited: boolean;
  position: string;
  positionContext: 'early' | 'middle' | 'late';
  stackBB: number;
  stackDepthLabel: string;
  numActivePlayers: number;
  facingRaise: boolean;
  potSizeBB: number;
  // Only for postflop:
  madeHand?: string;
}

function buildCoachingContext(state: GameState): CoachingContext {
  const hero = state.players.find(p => p.id === 'hero')!;
  const heroIndex = state.players.findIndex(p => p.id === 'hero');
  const isPreflop = state.currentRound === 'PREFLOP';
  const bigBlind = 2; // Default BB size in chips

  // Hand classification
  const { category, label, isSuited } = classifyHand(hero.cards);

  // Position
  const getPosition = (index: number) => {
    if (state.players.length === 2) return index === state.dealerIndex ? 'BTN' : 'BB';
    if (index === state.dealerIndex) return 'BTN';
    if (index === (state.dealerIndex + 1) % state.players.length) return 'SB';
    if (index === (state.dealerIndex + 2) % state.players.length) return 'BB';
    if (index === (state.dealerIndex + 3) % state.players.length) return 'UTG';
    return 'MP';
  };
  const position = getPosition(heroIndex);
  const positionContext = getPositionContext(position);

  // Stack depth
  const stackBB = Math.round(hero.stack / bigBlind);
  const stackDepthLabel = getStackDepthLabel(stackBB);

  // Action context
  const facingRaise = state.currentHighestBet > bigBlind;
  const activePlayers = state.players.filter(p => !p.hasFolded);
  const potSizeBB = Math.round(state.pot / bigBlind);

  // Postflop hand strength
  let madeHand: string | undefined;
  if (!isPreflop && state.communityCards.length > 0) {
    try {
      const evalResult = PokerEvaluator.evaluate(hero.cards, state.communityCards);
      madeHand = evalResult.name;
    } catch (e) {
      madeHand = 'Unknown';
    }
  }

  return {
    isPreflop,
    handCategory: category,
    handLabel: label,
    isSuited,
    position,
    positionContext,
    stackBB,
    stackDepthLabel,
    numActivePlayers: activePlayers.length,
    facingRaise,
    potSizeBB,
    madeHand,
  };
}

// ─── COACH FEEDBACK (LLM) ───────────────────────────────────────────────────

export async function getCoachFeedback(
  stateSnapshot: GameState,
  action: string,
  amount?: number
): Promise<string> {
  const hero = stateSnapshot.players.find(p => p.id === "hero");
  if (!hero) return "Waiting for your action...";

  const ctx = buildCoachingContext(stateSnapshot);
  const actionStr = action === "RAISE" ? `RAISED to ${amount}` : action;
  const gameStateJson = buildCompressedGameState(stateSnapshot, hero.id);

  // ── Build the stage-specific coaching block ──
  let stageInstructions: string;

  if (ctx.isPreflop) {
    stageInstructions = `
STAGE: PREFLOP

CRITICAL PREFLOP RULES (YOU MUST FOLLOW THESE):
- NEVER describe a preflop hand as "high card". There is no "made hand" preflop.
- Preflop evaluation is based ENTIRELY on: hand category, position, stack depth, and action context.
- DO NOT use postflop logic ("you only had high card") for preflop decisions.

Hand Category: ${ctx.handCategory} (${ctx.handLabel}${ctx.isSuited ? ' suited' : ' offsuit'})
Position: ${ctx.position} (${ctx.positionContext} position)
Stack Depth: ${ctx.stackBB}BB (${ctx.stackDepthLabel})
Facing a Raise: ${ctx.facingRaise ? 'YES' : 'NO (only blinds posted)'}
Players Still Active: ${ctx.numActivePlayers}
Pot Size: ${ctx.potSizeBB}BB

POSITION GUIDELINES:
- Early position (UTG): Only play premium and strong hands. Fold most speculative hands.
- Middle position: Moderate range. Strong broadways and pairs are fine.
- Late position (CO, BTN): Wide range. Many marginal hands become playable. Suited connectors and suited aces gain significant value.
- Button is the STRONGEST position — prefer raising over calling.

STACK DEPTH GUIDELINES:
- Deep stacks (50BB+): Suited hands, suited connectors, and suited aces gain implied odds value.
- Short stacks (<30BB): Favor high-card strength. Speculative hands lose value.

HAND CATEGORY REFERENCE:
- premium_pair (AA-QQ): Always raise/re-raise
- strong_pair (JJ-88): Raise in most spots, call facing heavy action
- weak_pair (77-22): Playable for set-mining with deep stacks and good odds
- strong_broadway (AK, AQ, AJ, KQ): Raise in most positions
- weak_broadway (KJ, QJ, JT): Playable in late position, fold in early position vs raises
- suited_connector (76s, 98s, etc.): Excellent in late position with deep stacks
- suited_ace (A2s-A9s): Very playable in late position, good for nut-flush potential
- offsuit_ace (A2o-A9o): Marginal, mostly fold except in late position with no raise
- trash: Fold unless in BB facing no raise`;
  } else {
    stageInstructions = `
STAGE: POSTFLOP (${stateSnapshot.currentRound})

Made Hand: ${ctx.madeHand || 'Unknown'}
Hand Category (preflop): ${ctx.handCategory} (${ctx.handLabel})
Position: ${ctx.position} (${ctx.positionContext} position)
Stack Depth: ${ctx.stackBB}BB (${ctx.stackDepthLabel})
Players Still Active: ${ctx.numActivePlayers}
Pot Size: ${ctx.potSizeBB}BB
Community Cards: ${stateSnapshot.communityCards.map(c => c.rank + c.suit.charAt(0)).join(' ')}

POSTFLOP GUIDELINES:
- Evaluate the student's made hand strength relative to the board texture.
- Consider whether the board is wet (many draws possible) or dry.
- Factor in position for betting/checking decisions.
- Reference the specific cards on the board in your advice.`;
  }

  const prompt = `System Instruction:
You are a poker coach helping a beginner improve. You give sharp, situation-specific advice.

Student Action: ${actionStr}
${stageInstructions}

Compressed Game State:
${gameStateJson}

Output STRICTLY in JSON:
{
  "verdict": "good | okay | bad",
  "better_action": "fold | call | raise | check | bet",
  "explanation": "Max 3 sentences. Simple everyday language. Reference position, hand category, and stack depth.",
  "key_mistake": "One specific mistake (if any). Say 'none' if the play was correct.",
  "tip": "One actionable improvement tip specific to this situation."
}

OUTPUT QUALITY RULES:
- NO jargon (no "GTO", "range merging", "polarized", "capped", "equity realization")
- NO generic advice that could apply to any hand
- ALWAYS mention the student's position (${ctx.position}) and hand (${ctx.handLabel}) in your explanation
- Be specific to THIS exact situation
- Keep it concise but insightful
${ctx.isPreflop ? '- NEVER say "high card" or evaluate raw card values. Use the hand CATEGORY provided above.' : ''}`;

  try {
    const text = await callGemini(prompt, {
      responseMimeType: "application/json",
      maxOutputTokens: 350,
      temperature: 0.3
    });

    if (text) {
       const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
       const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
       if (jsonMatch) {
          const json = JSON.parse(jsonMatch[0]);
          return `**Verdict: ${json.verdict.toUpperCase()}**\n\n${json.explanation}\n\n*Mistake:* ${json.key_mistake || 'None'}\n*Tip:* ${json.tip}`;
       }
    }
  } catch (error: any) {
    console.error(`Coach AI Error:`, error.message);
  }

  return getLocalCoachFeedback(stateSnapshot, action, amount);
}

// ─── LOCAL FALLBACK COACH (position + category aware) ───────────────────────

function getLocalCoachFeedback(state: GameState, action: string, amount?: number): string {
  const hero = state.players.find((p) => p.id === "hero");
  if (!hero) return "Analyzing the table dynamics...";

  const ctx = buildCoachingContext(state);
  const toCall = state.currentHighestBet - hero.currentBet;

  if (ctx.isPreflop) {
    // ── PREFLOP FALLBACK ──
    const playable = ['premium_pair', 'strong_pair', 'strong_broadway', 'suited_ace', 'suited_connector'];
    const marginal = ['weak_pair', 'weak_broadway', 'offsuit_ace'];
    const isPlayable = playable.includes(ctx.handCategory);
    const isMarginal = marginal.includes(ctx.handCategory);

    if (action === "FOLD") {
      if (isPlayable) {
        return `**Verdict: BAD**\nFolding ${ctx.handLabel} from the ${ctx.position} is too tight. This is a ${ctx.handCategory.replace('_', ' ')} — ${ctx.positionContext === 'late' ? 'especially strong' : 'playable'} in ${ctx.positionContext} position with ${ctx.stackBB}BB.\n\n*Mistake:* Folding a playable hand.\n*Tip:* ${ctx.positionContext === 'late' ? 'On the button, raise with hands like this to take control.' : 'Consider calling or raising rather than folding.'}`;
      }
      if (ctx.handCategory === 'trash') {
        return `**Verdict: GOOD**\nGood fold. ${ctx.handLabel} is not worth playing from ${ctx.position}, especially ${ctx.facingRaise ? 'facing a raise' : 'with this stack depth'}.\n\n*Mistake:* None\n*Tip:* Stay disciplined — folding weak hands saves you money in the long run.`;
      }
      if (isMarginal && ctx.positionContext === 'late' && !ctx.facingRaise) {
        return `**Verdict: OKAY**\n${ctx.handLabel} is marginal, but from the ${ctx.position} with no raise, you could have seen a cheap flop.\n\n*Mistake:* Missed a low-risk opportunity in late position.\n*Tip:* In late position with no raise ahead, consider calling with marginal hands to see the flop.`;
      }
      return `**Verdict: OKAY**\nFolding ${ctx.handLabel} from ${ctx.position} is a reasonable play.\n\n*Mistake:* None\n*Tip:* Focus on playing stronger hands from early position.`;
    }

    if (action === "CALL") {
      if (isPlayable && ctx.positionContext === 'late') {
        return `**Verdict: OKAY**\nCalling is fine, but with ${ctx.handLabel} on the ${ctx.position}, raising would let you take control of the pot.\n\n*Mistake:* Missed chance to raise in a strong position.\n*Tip:* Prefer raising over calling in late position to apply pressure.`;
      }
      return `**Verdict: GOOD**\nCalling with ${ctx.handLabel} from ${ctx.position} is a solid, controlled play at ${ctx.stackBB}BB deep.\n\n*Mistake:* None\n*Tip:* Keep paying attention to your position when deciding how to enter pots.`;
    }

    if (action === "RAISE") {
      if (isPlayable) {
        return `**Verdict: GOOD**\nNice raise with ${ctx.handLabel} from ${ctx.position}. This hand plays well as an open-raise, especially with ${ctx.stackBB}BB.\n\n*Mistake:* None\n*Tip:* Keep using position and strong hands to raise and build pots.`;
      }
      if (ctx.handCategory === 'trash') {
        return `**Verdict: BAD**\nRaising with ${ctx.handLabel} from ${ctx.position} is too loose. This is a trash hand that doesn't play well postflop.\n\n*Mistake:* Raising with a hand that has little postflop value.\n*Tip:* Only bluff-raise with hands that have some backup equity, like suited connectors.`;
      }
      return `**Verdict: OKAY**\nRaising with ${ctx.handLabel} from ${ctx.position} is slightly aggressive, but acceptable if you play well postflop.\n\n*Mistake:* Minor — this hand is marginal for a raise from this position.\n*Tip:* Be selective about which hands you raise from early/middle position.`;
    }

    if (action === "CHECK") {
      return `**Verdict: GOOD**\nChecking from the big blind with ${ctx.handLabel} is standard — you see the flop for free.\n\n*Mistake:* None\n*Tip:* In the BB, check when you have a free look and evaluate on the flop.`;
    }
  } else {
    // ── POSTFLOP FALLBACK ──
    if (action === "FOLD" && state.currentHighestBet < 5) {
      return `**Verdict: OKAY**\nEarly fold with ${ctx.madeHand || 'a weak hand'} from ${ctx.position}. Low pressure, but you could have seen another card cheaply.\n\n*Mistake:* Potentially folding too early with minimal investment.\n*Tip:* With small bets to call, consider staying in if you have any draw potential.`;
    }

    if (action === "RAISE" && amount && amount > state.pot * 0.5) {
      return `**Verdict: OKAY**\nBig bet from ${ctx.position} with ${ctx.madeHand || 'your hand'}. Make sure your hand strength justifies this sizing.\n\n*Mistake:* Verify your hand is strong enough for this bet size.\n*Tip:* Size your bets based on what you want opponents to do — call with worse or fold out draws.`;
    }

    if (action === "CHECK") {
      return `**Verdict: OKAY**\nChecking from ${ctx.position} with ${ctx.madeHand || 'your hand'}. Safe play to control the pot size.\n\n*Mistake:* None — but consider if you're missing value.\n*Tip:* If you have a strong hand, consider betting to build the pot while opponents can still call.`;
    }
  }

  return `**Verdict: OKAY**\nLocal analysis: ${ctx.handLabel} from ${ctx.position} at ${ctx.stackBB}BB.\n\n*Mistake:* Unable to fully evaluate (API unavailable).\n*Tip:* Play disciplined, position-aware poker.`;
}

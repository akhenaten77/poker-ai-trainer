"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GameState } from "../../engine/game";
import { PokerAI } from "../../engine/ai";
import { PokerEvaluator } from "../../engine/evaluator";

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

export async function getCoachFeedback(
  stateSnapshot: GameState,
  action: string,
  amount?: number
): Promise<string> {
  const hero = stateSnapshot.players.find(p => p.id === "hero");
  if (!hero) return "Waiting for your action...";

  const actionStr = action === "RAISE" ? `RAISED to ${amount}` : action;
  
  let actualHand = "High Card";
  try {
     const evalResult = PokerEvaluator.evaluate(hero.cards, stateSnapshot.communityCards);
     actualHand = evalResult.name;
  } catch(e) {}

  const gameStateJson = buildCompressedGameState(stateSnapshot, hero.id);

  const prompt = `System Instruction:
You are a poker coach helping a beginner improve.

Goals:
- Evaluate the player’s last move
- Give clear, practical advice
- Avoid jargon like "GTO", "range merging", etc.

Student Action:
The student chose to: ${actionStr}
Actual Hand Strength (IMPORTANT): ${actualHand}

Game State Snapshot:
${gameStateJson}

Output STRICTLY in JSON:
{
  "verdict": "good | okay | bad",
  "better_action": "fold | call | raise | check | bet",
  "explanation": "Explain in simple, everyday language (max 3 sentences)",
  "key_mistake": "One specific mistake (if any)",
  "tip": "One actionable improvement tip"
}

Rules:
- Be specific to THIS hand only
- Do NOT give generic advice
- Reference actual cards, pot, and actions
- Keep it concise
- Do NOT guess what hand the student has. Base your advice on the provided Actual Hand Strength.`;

  try {
    const text = await callGemini(prompt, { 
      responseMimeType: "application/json",
      maxOutputTokens: 300, 
      temperature: 0.4
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

function getLocalCoachFeedback(state: any, action: string, amount?: number): string {
  const hero = state.players.find((p: any) => p.id === "hero");
  if (!hero) return "Analyzing the table dynamics...";
  
  const toCall = state.currentHighestBet - hero.currentBet;
  const isHighStakes = (amount || 0) > state.pot * 0.5 || toCall > state.pot * 0.2;

  if (action === "FOLD" && state.currentHighestBet < 5) {
     return "**Verdict: OKAY**\nAggressive fold. You dropped out with almost zero pressure—usually, it's worth seeing a flop with most hands for only 1 or 2 BB.";
  }
  
  if (action === "RAISE" && isHighStakes) {
     return `**Verdict: OKAY**\nSizable raise. By betting ${amount} BB, you're putting significant pressure on the table.`;
  }

  if (action === "CALL" && toCall > 50) {
     return "**Verdict: BAD**\nThat's a wide call. Ensure your pot odds justify the draw.";
  }

  if (action === "CHECK") {
     return "**Verdict: GOOD**\nSolid check. You're maintaining the pot size and keeping your ranges balanced.";
  }

  return "**Verdict: OKAY**\nAPI quota exhausted. Local heuristic active: play disciplined poker.";
}

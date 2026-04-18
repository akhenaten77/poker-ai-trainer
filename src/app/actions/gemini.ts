"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GameState } from "../../engine/game";
import { PokerAI } from "../../engine/ai";

const API_KEY = process.env.GEMINI_API_KEY || "";

const MODEL_HIERARCHY = [
  "models/gemma-3-27b-it",
  "models/gemini-3.1-flash-lite-preview",
  "models/gemini-2.5-flash-lite",
  "models/gemini-2.5-flash"
];

// Initialize the AI client
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

/**
 * Shared helper to call Gemini with a structured fallback sequence.
 */
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
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (text) {
        console.log(`AI Success [${modelId}]`);
        return text;
      }
    } catch (error: any) {
      console.warn(`Model [${modelId}] failed/unavailable:`, error.message);
      // Continue to next model in hierarchy
    }
  }

  return null;
}
/**
 * Formats a rich description of the current table state for AI processing.
 * Includes positions (D, SB, BB), stacks, and detailed betting info.
 */
function formatTableState(state: GameState) {
  const { players, dealerIndex, currentRound, communityCards, pot, currentHighestBet, handHistory } = state;
  const numPlayers = players.length;
  
  const sbIndex = (dealerIndex + 1) % numPlayers;
  const bbIndex = (dealerIndex + 2) % numPlayers;

  const playerTable = players.map((p, i) => {
    let posLabel = "  ";
    if (i === dealerIndex) posLabel = " D";
    if (i === sbIndex) posLabel = "SB";
    if (i === bbIndex) posLabel = "BB";
    
    const status = p.hasFolded ? "[FOLDED]" : p.isAllIn ? "[ALL-IN]" : "";
    return `${posLabel} | ${p.name.padEnd(8)} | Stack: ${p.stack.toString().padEnd(5)} | Current Bet: ${p.currentBet} ${status}`;
  }).join("\n");

  const boardStr = communityCards.length > 0 
    ? communityCards.map(c => c.rank + c.suit.charAt(0)).join(" ") 
    : "Empty (Pre-flop)";

  return `
TABLE STATE:
Round: ${currentRound}
Board: [${boardStr}]
Total Pot: ${pot}
Highest Bet this round: ${currentHighestBet}

PLAYERS:
Pos | Name     | Status
-----------------------
${playerTable}

RECENT LOGS:
${handHistory.slice(-15).join("\n")}
`;
}

/**
 * Returns a bot's decision (action and amount) based on the current game state.
 * Falls back to local heuristic AI if both Gemini calls fail.
 */
export async function getBotDecision(
  state: GameState,
  botIndex: number
): Promise<{ action: 'FOLD' | 'CHECK' | 'CALL' | 'RAISE'; amount?: number }> {
  const bot = state.players[botIndex];
  if (!bot || !bot.isBot) return { action: "CHECK" };

  const toCall = state.currentHighestBet - bot.currentBet;
  
  const difficultyPrompts = {
    'Easy': 'You are a loose-passive beginner. Play for fun, don\'t be too aggressive. You often make mistakes.',
    'Medium': 'You are a skilled TAG (Tight-Aggressive) bot. Play solid, disciplined poker.',
    'Hard': 'You are a world-class GTO poker professional. Play optimally and exploit every weakness of your opponents.'
  };

  const tableContext = formatTableState(state);
  const prompt = `System: ${difficultyPrompts[state.difficulty as keyof typeof difficultyPrompts] || difficultyPrompts.Medium}
  
You are an expert poker bot. Decide your NEXT move.

${tableContext}

YOUR INFO:
Player Name: ${bot.name}
Your Hand: ${bot.cards.map(c => c.rank + c.suit.charAt(0)).join(" ")}
Stack: ${bot.stack} | Your current bet this street: ${bot.currentBet} | Amount to CALL: ${toCall}

INSTRUCTION:
Respond with ONLY a JSON object. 
Format: {"action":"FOLD"|"CHECK"|"CALL"|"RAISE","amount":number}`;

  try {
    const text = await callGemini(prompt, {
      responseMimeType: "application/json",
      maxOutputTokens: 150,
      temperature: 0.1,
    });

    if (text) {
      console.log(`AI Success - BOT DECISION`);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
         const json = JSON.parse(jsonMatch[0]);
         // Sanitize 
         if (json.action === "CALL" && toCall === 0) json.action = "CHECK";
         if (json.action === "CHECK" && toCall > 0) json.action = "FOLD";
         if (json.action === "RAISE") {
           const minTotal = state.currentHighestBet + state.minRaise;
           if (!json.amount || json.amount < minTotal) json.amount = minTotal;
           const maxPossible = bot.stack + bot.currentBet;
           if (json.amount > maxPossible) json.amount = maxPossible;
         }
         return json;
      }
    }
  } catch (error: any) {
    console.error(`Gemini Bot Decision Error:`, error.message);
  }

  // Tier 3: Local Heuristic AI (No API required)
  console.log("FALLBACK: Using local PokerAI engine for bot decision.");
  return PokerAI.decideAction(state, botIndex);
}

/**
 * Provides coaching feedback for the Hero's action.
 * Falls back to local heuristics if API fails.
 */
export async function getCoachFeedback(
  stateSnapshot: GameState,
  action: string,
  amount?: number
): Promise<string> {
  const hero = stateSnapshot.players.find(p => p.id === "hero");
  if (!hero) return "Waiting for your action...";

  const toCall = stateSnapshot.currentHighestBet - hero.currentBet;
  const actionStr = action === "RAISE" ? `RAISED to ${amount}` : action;
  const tableContext = formatTableState(stateSnapshot);

  const prompt = `You are a friendly, expert Poker Coach. Your student (HERO) just made a move.
  
${tableContext}

STUDENT ACTION: 
${hero.name} just chose to: ${actionStr}
Student hand: ${hero.cards.map(c => c.rank + c.suit.charAt(0)).join(" ")}

TASK:
Provide a 2-3 sentence strategic critique of the student's move. 
- Use simple, conversational English.
- Explain the "WHY" behind your advice based on the positions and historical bets.
- Avoid fancy jargon like "GTO", "Capped Range", or "Polarized" unless you define them simply.
- Focus on hand strength versus what opponents might be holding based on their actions.
- Keep it under 400 characters.`;

  try {
    const text = await callGemini(prompt, { 
      maxOutputTokens: 500, 
      temperature: 0.7     
    });

    if (text) return text.trim();
  } catch (error: any) {
    console.error(`Coach AI Error:`, error.message);
  }

  // Tier 3: Local Heuristic Fallback
  return getLocalCoachFeedback(stateSnapshot, action, amount);
}

/**
 * Local strategic heuristic for when API is unavailable.
 */
function getLocalCoachFeedback(state: any, action: string, amount?: number): string {
  const hero = state.players.find((p: any) => p.id === "hero");
  if (!hero) return "Analyzing the table dynamics...";
  
  const toCall = state.currentHighestBet - hero.currentBet;
  const isHighStakes = (amount || 0) > state.pot * 0.5 || toCall > state.pot * 0.2;

  if (action === "FOLD" && state.currentHighestBet < 5) {
     return "Aggressive fold. You dropped out with almost zero pressure—usually, it's worth seeing a flop with most hands for only 1 or 2 BB.";
  }
  
  if (action === "RAISE" && isHighStakes) {
     return `Sizable raise. By betting ${amount} BB, you're putting significant pressure on the table. This is a strong Value bet if you have a top-tier hand, or a bold BLUFF otherwise.`;
  }

  if (action === "CALL" && toCall > 50) {
     return "That's a wide call. Ensure your pot odds justify the draw, otherwise, standard GTO recommends folding to such large bets unless you have top pair or better.";
  }

  if (action === "CHECK") {
     return "Solid check. You're maintaining the pot size and keeping your ranges balanced. A classic move for protection or pot control.";
  }

  return "Gemini API quota exhausted. Continuing with Local Heuristic Coach: Play disciplined Tight-Aggressive poker.";
}

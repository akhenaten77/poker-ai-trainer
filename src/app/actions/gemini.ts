"use server";

import { GoogleGenAI } from "@google/genai";
import { GameState } from "../../engine/game";
import { PokerAI } from "../../engine/ai";

const API_KEY = process.env.GEMINI_API_KEY || "";

const MODEL_HIERARCHY = [
  "gemma-3-27b-it",
  "gemini-3.1-flash-lite-preview",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash"
];

// Initialize the AI client
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

/**
 * Shared helper to call Gemini with a structured fallback sequence.
 */
async function callGemini(
  prompt: string, 
  options: { responseMimeType?: string; maxOutputTokens?: number; temperature?: number }
): Promise<string | null> {
  if (!ai) {
    console.error("Gemini API not initialized (missing API key)");
    return null;
  }

  for (const modelId of MODEL_HIERARCHY) {
    try {
      const fullModelId = modelId.startsWith('models/') ? modelId : `models/${modelId}`;
      const model = ai.getGenerativeModel({ model: fullModelId });
      
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

  const prompt = `System: ${difficultyPrompts[state.difficulty as keyof typeof difficultyPrompts] || difficultyPrompts.Medium}
  
You are a skilled Texas Hold'em poker bot. Decide your action.

Round: ${state.currentRound} | Board: ${state.communityCards.map(c => c.rank + c.suit.charAt(0)).join(" ") || "none"} | Pot: ${state.pot} | ToCall: ${toCall} | MinRaise: ${state.minRaise}
You: ${bot.name} | Stack: ${bot.stack} | CurrentBet: ${bot.currentBet} | Hole: ${bot.cards.map(c => c.rank + c.suit.charAt(0)).join(" ")}
Recent history:
${state.handHistory.slice(-5).join("\n")}

Respond with ONLY a JSON object. No preamble, no explanation.
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
  const heroCards = hero.cards.map(c => c.rank + c.suit.charAt(0)).join(" ");
  const board = stateSnapshot.communityCards.map(c => c.rank + c.suit.charAt(0)).join(" ") || "preflop";
  const history = stateSnapshot.handHistory.slice(-8).join("\n");

  const prompt = `You are an elite GTO poker coach. The student just played: ${actionStr}.

CONTEXT:
Student Hand: ${heroCards}
Board: ${stateSnapshot.currentRound} [${board}]
Pot: ${stateSnapshot.pot} | Student Stack: ${hero.stack} | ToCall was: ${toCall}
Hand History:
${history}

TASK:
Provide a 2-3 sentence strategic critique. 
Analyze: 1. Hand strength/equity. 2. Opponent range. 3. GTO compliance.
Be sharp. No markdown. MAX 400 characters.`;

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

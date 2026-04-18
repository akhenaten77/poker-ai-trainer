"use server";

import { GoogleGenAI } from "@google/genai";
import { GameState } from "../../engine/game";
import { PokerAI } from "../../engine/ai";

const API_KEY = process.env.GEMINI_API_KEY || "";
const PRIMARY_MODEL = "gemini-2.5-flash-lite";
const FALLBACK_MODEL = "gemini-2.5-flash";

// Initialize the AI client
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

/**
 * Shared helper to call Gemini with a structured fallback sequence.
 */
async function callGemini(
  prompt: string, 
  options: { responseMimeType?: string; maxOutputTokens?: number; temperature?: number }
): Promise<string | null> {
  if (!ai) return null;

  // Attempt 1: Primary Model (Lite)
  try {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: options,
    });
    if (response.text) return response.text;
  } catch (error: any) {
    console.warn(`Primary Model [${PRIMARY_MODEL}] failed:`, error.message);
  }

  // Attempt 2: Fallback Model (Standard Flash)
  try {
    const response = await ai.models.generateContent({
      model: FALLBACK_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: options,
    });
    if (response.text) return response.text;
  } catch (error: any) {
    console.warn(`Fallback Model [${FALLBACK_MODEL}] failed:`, error.message);
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

  const prompt = `System: ${difficultyPrompts[state.difficulty] || difficultyPrompts.Medium}
  
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

    if (!text) throw new Error("All AI models failed or returned empty.");

    // Robust JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    
    const json = JSON.parse(jsonMatch[0]);
    console.log(`AI Action [Bot ${botIndex}]:`, json.action, json.amount || "");

    // Sanitize response
    if (json.action === "CALL" && toCall === 0) json.action = "CHECK";
    if (json.action === "CHECK" && toCall > 0) json.action = "FOLD";
    if (json.action === "RAISE") {
      const minTotal = state.currentHighestBet + state.minRaise;
      if (!json.amount || json.amount < minTotal) json.amount = minTotal;
      const maxPossible = bot.stack + bot.currentBet;
      if (json.amount > maxPossible) json.amount = maxPossible;
    }

    return json as { action: 'FOLD' | 'CHECK' | 'CALL' | 'RAISE'; amount?: number };
  } catch (error: any) {
    console.error(`Gemini Error:`, error.message);
    return PokerAI.decideAction(state, botIndex, "TAG");
  }
}

/**
 * Returns coaching advice based on the HERO's action.
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
Analyze:
1. Student's hand strength & pot equity.
2. Opponent intent (gauge their range based on the betting history).
3. Was this move EV+, GTO-compliant, or a mistake?

Be sharp and insightful. No markdown. MAX 400 characters.`;

  try {
    const text = await callGemini(prompt, { 
      maxOutputTokens: 500, 
      temperature: 0.7     
    });

    return text?.trim() || "Interesting play. Consider the pot odds next time.";
  } catch (error: any) {
    console.error(`Coach AI Error:`, error.message);
    return "Coach is currently reviewing your hand history...";
  }
}

import { GameState, BettingRound } from './game';
import { PokerEvaluator } from './evaluator';
import { Card, toSolverCard } from './deck';

export type AIProfile = 'NIT' | 'TAG' | 'LAG' | 'STATION';

export interface AIAction {
  action: 'FOLD' | 'CHECK' | 'CALL' | 'RAISE';
  amount?: number;
}

export class PokerAI {
  /**
   * Determine the action for a given bot player based on their profile and the game state.
   */
  static decideAction(state: GameState, playerIndex: number, profile: AIProfile = 'TAG'): AIAction {
    const player = state.players[playerIndex];
    if (!player || !player.isBot || player.hasFolded || player.isAllIn) {
       return { action: 'CHECK' }; // Fallback
    }

    const holeCards = player.cards;
    const communityCards = state.communityCards;
    
    // Evaluate current hand strength
    let handRank = 0;
    if (communityCards.length > 0) {
      const evaled = PokerEvaluator.evaluate(holeCards, communityCards);
      handRank = evaled.rank; 
      // rank is an integer. High card might be ~1-1000, Pairs higher, etc.
      // pokersolver rank values: higher is better. High Card is ~0-7462 in standard evaluators, 
      // but pokersolver ranks are generally integers representing the category. 
      // Wait, pokersolver uses `Hand.solve(cards).rank`. In pokersolver, rank goes from 1 (High Card) to 9 or 10 (Royal Flush) usually... wait. No, pokersolver `rank` actually goes from 1(High Card) up to 9(Straight Flush). Let's assume standard rank.
    } else {
      // Preflop heuristic
      handRank = this.evaluatePreflop(holeCards);
    }

    const toCall = state.currentHighestBet - player.currentBet;
    const potSize = state.pot;
    const potOdds = toCall / (potSize + toCall);
    
    // Simplified Heuristic Matrix based on Profile, Hand Strength, and Pot Odds
    let aggressiveness = 0.5;
    let tightness = 0.5;

    switch (profile) {
      case 'NIT': aggressiveness = 0.2; tightness = 0.8; break;
      case 'TAG': aggressiveness = 0.7; tightness = 0.6; break;
      case 'LAG': aggressiveness = 0.9; tightness = 0.3; break;
      case 'STATION': aggressiveness = 0.2; tightness = 0.1; break;
    }

    // Determine Base Actions
    const randomFactor = Math.random();
    
    if (communityCards.length === 0) {
      // PREFLOP logic
      if (handRank >= 80) { // Premium
        if (randomFactor < aggressiveness) return { action: 'RAISE', amount: state.currentHighestBet * 2.5 + state.minRaise };
        return toCall > 0 ? { action: 'CALL' } : { action: 'CHECK' };
      } else if (handRank >= 50) { // Strong
        return toCall > 0 ? { action: 'CALL' } : { action: 'CHECK' };
      } else if (handRank >= 30 && tightness < 0.5) { // Medium, LAG might play
        return toCall > 0 ? { action: 'CALL' } : { action: 'CHECK' };
      } else {
        if (toCall === 0) return { action: 'CHECK' };
        if (randomFactor > tightness && randomFactor < aggressiveness) return { action: 'RAISE', amount: state.currentHighestBet * 2 }; // Bluff
        return { action: 'FOLD' };
      }
    } else {
      // POSTFLOP logic
      // pokersolver rank: 0 high card, 1 pair, 2 two pair, 3 trips, 4 straight, 5 flush, 6 full house, 7 quads, 8 straight flush
      if (handRank >= 3) { // Trips or better
         if (randomFactor < aggressiveness) return { action: 'RAISE', amount: state.currentHighestBet + state.pot * 0.5 };
         return toCall > 0 ? { action: 'CALL' } : { action: 'CHECK' };
      } else if (handRank === 2) { // Two Pair
         return toCall > 0 ? { action: 'CALL' } : { action: 'CHECK' };
      } else if (handRank === 1) { // Pair
         if (toCall > state.pot * 0.5 && tightness > 0.5) return { action: 'FOLD' };
         return toCall > 0 ? { action: 'CALL' } : { action: 'CHECK' };
      } else {
         // High card
         if (toCall === 0) return { action: 'CHECK' };
         if (randomFactor > tightness && randomFactor < aggressiveness) return { action: 'RAISE', amount: state.currentHighestBet + state.pot * 0.5 }; // Bluff
         if (tightness < 0.3 && potOdds < 0.2) return { action: 'CALL' }; // Station floats
         return { action: 'FOLD' };
      }
    }
  }

  /**
   * Basic Preflop Strength Evaluator returning 0-100 scale
    */
  static evaluatePreflop(cards: Card[]): number {
    if (cards.length !== 2) return 0;
    
    const rankValues: Record<string, number> = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
      'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };

    const val1 = rankValues[cards[0].rank];
    const val2 = rankValues[cards[1].rank];
    
    let score = val1 + val2;
    const isSuited = cards[0].suit === cards[1].suit;
    const isPair = val1 === val2;

    if (isPair) score *= 2.5; // AA = 14*2*2.5 = 70
    if (isSuited) score += 10;
    
    // Slight bump for connected cards
    const gap = Math.abs(val1 - val2);
    if (gap === 1) score += 5;
    if (gap === 2) score += 3;

    // Normalize roughly to 0-100
    // Max is AA = 70. Suited connectors AKs = 27 + 10 + 5 = 42
    // Let's cap at 100
    return Math.min(100, (score / 70) * 100);
  }
}

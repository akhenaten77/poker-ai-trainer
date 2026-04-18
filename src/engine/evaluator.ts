import Hand from 'pokersolver';
import { Card, toSolverCard } from './deck';

export interface EvaluatedHand {
  name: string;
  descr: string;
  rank: number;
  cards: string[]; // winning cards
}

export class PokerEvaluator {
  /**
   * Evaluates a Texas Hold'em hand
   * @param holeCards - The 2 hole cards for the player
   * @param communityCards - The 3, 4, or 5 community cards on the board
   */
  static evaluate(holeCards: Card[], communityCards: Card[]): EvaluatedHand {
    const allCards = [...holeCards, ...communityCards].map(toSolverCard);
    // pokersolver uses capital suits for output sometimes, but input works with lower or upper usually.
    // Wait, pokersolver uses format like 'Ah', 'Td', '2c'
    // Our toSolverCard returns 'Ah', etc.

    // Using Hand.solve from pokersolver
    const solved = Hand.Hand.solve(allCards);
    return {
      name: solved.name,
      descr: solved.descr,
      rank: solved.rank,
      cards: solved.cards.map((c: any) => c.value + c.suit), // just strings
    };
  }

  /**
   * Compare multiple hands and return the winner(s)
   */
  static getWinners(playersHoleCards: Card[][], communityCards: Card[]): { winnerIndices: number[] } {
    const hands = playersHoleCards.map((holeCards, index) => {
      const allCards = [...holeCards, ...communityCards].map(toSolverCard);
      const solved = Hand.Hand.solve(allCards);
      // attach player index to the solved object so we can map back the winner
      (solved as any).playerIndex = index;
      return solved;
    });

    const winners = Hand.Hand.winners(hands);
    
    // winners is an array of Hand objects (could be ties)
    const winnerIndices = winners.map((w: any) => w.playerIndex as number);

    return { winnerIndices };
  }
}

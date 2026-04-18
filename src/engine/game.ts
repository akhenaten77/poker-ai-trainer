import { Card } from './deck';

export type BettingRound = 'PREFLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN';

export interface Player {
  id: string;
  name: string;
  isBot: boolean;
  stack: number;
  cards: Card[];
  currentBet: number;
  hasFolded: boolean;
  hasActed: boolean;
  isAllIn: boolean;
}

export interface ShowdownResult {
  id: string;
  name: string;
  cards: Card[];
  handName: string;
  handDescr: string;
  isWinner: boolean;
  winAmount: number;
}

export interface GameState {
  players: Player[];
  communityCards: Card[];
  pot: number;
  currentRound: BettingRound;
  dealerIndex: number;
  currentPlayerIndex: number;
  currentHighestBet: number;
  minRaise: number;
  deck: Card[];
  winners: string[]; // player IDs
  showdownResults: ShowdownResult[]; // populated at end of hand
  handHistory: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export class PokerEngine {
  static getNextPlayerIndex(state: GameState, startIndex: number): number {
    let index = (startIndex + 1) % state.players.length;
    let iterations = 0;
    while ((state.players[index].hasFolded || state.players[index].isAllIn) && iterations < state.players.length) {
      index = (index + 1) % state.players.length;
      iterations++;
    }
    return index;
  }

  static isRoundComplete(state: GameState): boolean {
    const activePlayers = state.players.filter(p => !p.hasFolded && !p.isAllIn);
    if (activePlayers.length <= 1) return true; // everyone folded except one, or all-in

    return activePlayers.every(p => p.hasActed && p.currentBet === state.currentHighestBet);
  }
}

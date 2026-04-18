import { create } from 'zustand';
import { GameState, PokerEngine } from '../engine/game';
import { Deck } from '../engine/deck';
import { PokerEvaluator } from '../engine/evaluator';

export interface GameStore extends GameState {
  initializeGame: (name: string, botsCount: number, startingStack: number, difficulty: 'Easy' | 'Medium' | 'Hard') => void;
  startHand: () => void;
  playerAction: (action: 'FOLD' | 'CHECK' | 'CALL' | 'RAISE', amount?: number) => void;
  advanceRound: () => void;
  evaluateShowdown: () => void;
  resetGame: () => void;
  coachAdvices: { text: string; type: 'ADVICE' | 'STREET' | 'SYSTEM' }[];
  addAdvice: (message: string, type?: 'ADVICE' | 'STREET' | 'SYSTEM') => void;
  addLog: (message: string) => void;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const INITIAL_STATE: GameState = {
  players: [],
  communityCards: [],
  pot: 0,
  currentRound: 'PREFLOP',
  dealerIndex: 0,
  currentPlayerIndex: 1, // UTG preflop
  currentHighestBet: 0,
  minRaise: 2, // Assuming 1/2 blinds initially
  deck: [],
  winners: [],
  showdownResults: [],
  handHistory: [],
  difficulty: 'Medium',
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...INITIAL_STATE,
  coachAdvices: [],
  addAdvice: (text, type = 'ADVICE') => set(s => ({ coachAdvices: [...s.coachAdvices, { text, type }] })),
  addLog: (msg) => set(s => ({ handHistory: [...s.handHistory, msg] })),
  resetGame: () => set({ ...INITIAL_STATE, coachAdvices: [{ text: "Session reset. Ready for a new game.", type: 'SYSTEM' }] }),

  initializeGame: (name: string, botsCount: number, startingStack: number, difficulty: 'Easy' | 'Medium' | 'Hard') => {
    const players = [
      { id: 'hero', name: name || 'HERO', isBot: false, stack: startingStack, cards: [], currentBet: 0, hasFolded: false, hasActed: false, isAllIn: false },
    ];
    for (let i = 0; i < botsCount; i++) {
      players.push({
        id: `bot-${i + 1}`,
        name: `BOT ${i + 1}`,
        isBot: true,
        stack: startingStack,
        cards: [],
        currentBet: 0,
        hasFolded: false,
        hasActed: false,
        isAllIn: false,
      });
    }

    set({ players, dealerIndex: 0, difficulty });
    get().startHand();
  },

  startHand: () => {
    const { players, dealerIndex } = get();
    const deck = new Deck();
    deck.shuffle();

    // Reset players for new hand
    const activePlayers = players.map(p => ({
      ...p,
      cards: deck.drawMany(2),
      currentBet: 0,
      hasFolded: false,
      hasActed: false,
      isAllIn: p.stack === 0,
    }));

    // Post blinds (assuming 1/2)
    const sbIndex = (dealerIndex + 1) % activePlayers.length;
    const bbIndex = (dealerIndex + 2) % activePlayers.length;
    
    // Simplistic blind posting
    activePlayers[sbIndex].stack -= 1;
    activePlayers[sbIndex].currentBet = 1;
    activePlayers[bbIndex].stack -= 2;
    activePlayers[bbIndex].currentBet = 2;

    const pot = 3;
    const currentHighestBet = 2;
    const currentPlayerIndex = PokerEngine.getNextPlayerIndex({ ...get(), players: activePlayers } as GameState, bbIndex);

    set({
      players: activePlayers,
      deck: deck['cards'], // access private state for simplicity in our store
      communityCards: [],
      pot,
      currentRound: 'PREFLOP',
      currentHighestBet,
      currentPlayerIndex,
      minRaise: 2,
      winners: [],
      showdownResults: [],
      handHistory: ['Hand Started', 'Blinds Posted: 1/2'],
      coachAdvices: [{ text: "New hand started. Good luck!", type: 'SYSTEM' }],
    });
  },

  playerAction: (action, amount) => {
    const state = get();
    const players = [...state.players];
    const player = players[state.currentPlayerIndex];
    let { pot, currentHighestBet, minRaise, handHistory } = state;

    if (action === 'FOLD') {
      player.hasFolded = true;
      handHistory = [...handHistory, `${player.name} folds`];
    } else if (action === 'CHECK') {
      player.hasActed = true;
      handHistory = [...handHistory, `${player.name} checks`];
    } else if (action === 'CALL') {
      const callAmount = currentHighestBet - player.currentBet;
      const actualCall = Math.min(callAmount, player.stack);
      player.stack -= actualCall;
      player.currentBet += actualCall;
      pot += actualCall;
      player.hasActed = true;
      if (player.stack === 0) player.isAllIn = true;
      handHistory = [...handHistory, `${player.name} calls ${actualCall}`];
    } else if (action === 'RAISE' && amount) {
      const totalBet = amount;
      const addedAmount = totalBet - player.currentBet;
      player.stack -= addedAmount;
      player.currentBet = totalBet;
      pot += addedAmount;
      currentHighestBet = totalBet;
      player.hasActed = true;
      if (player.stack === 0) player.isAllIn = true;
      
      // Reset hasActed for everyone else who hasn't folded
      players.forEach((p, idx) => {
        if (idx !== state.currentPlayerIndex && !p.hasFolded) {
          p.hasActed = false;
        }
      });
      handHistory = [...handHistory, `${player.name} raises to ${totalBet}`];
    }

    const nextState = { ...state, players, pot, currentHighestBet, minRaise, handHistory, coachAdvices: state.coachAdvices };

    if (PokerEngine.isRoundComplete(nextState as GameState)) {
      set({ ...nextState }); 
      get().advanceRound();
    } else {
      const nextIndex = PokerEngine.getNextPlayerIndex(nextState as GameState, state.currentPlayerIndex);
      const nextPlayer = players[nextIndex];
      set({ 
        ...nextState,
        currentPlayerIndex: nextIndex,
      });

      if (!nextPlayer?.isBot) {
        get().addAdvice("Action is on you, HERO.", 'SYSTEM');
      }
    }
  },

  advanceRound: () => {
    const state = get();
    const players = state.players.map(p => ({ ...p, currentBet: 0, hasActed: false }));
    const deckInfo = new Deck();
    deckInfo['cards'] = state.deck; // restore
    let communityCards = [...state.communityCards];
    let nextRound = state.currentRound;

    // Check if only one player left (everyone else folded)
    const activePlayers = players.filter(p => !p.hasFolded);
    if (activePlayers.length === 1) {
      set({ 
        winners: [activePlayers[0].id], 
        players, 
        showdownResults: [{
          id: activePlayers[0].id,
          name: activePlayers[0].name,
          cards: activePlayers[0].cards,
          handName: "Winner by Fold",
          handDescr: "Everyone else folded",
          isWinner: true,
          winAmount: state.pot
        }],
        handHistory: [...state.handHistory, `${activePlayers[0].name} wins ${state.pot}`] 
      });
      return; 
    }

    if (state.currentRound === 'PREFLOP') {
      communityCards = deckInfo.drawMany(3);
      nextRound = 'FLOP';
    } else if (state.currentRound === 'FLOP') {
      communityCards = [...communityCards, ...deckInfo.drawMany(1)];
      nextRound = 'TURN';
    } else if (state.currentRound === 'TURN') {
      communityCards = [...communityCards, ...deckInfo.drawMany(1)];
      nextRound = 'RIVER';
    } else {
      get().evaluateShowdown();
      return;
    }

    // First to act after flop is SB (or next active player)
    const firstToAct = PokerEngine.getNextPlayerIndex({ ...state, players } as GameState, state.dealerIndex);

    set({
      players,
      communityCards,
      deck: deckInfo['cards'],
      currentRound: nextRound,
      currentHighestBet: 0,
      currentPlayerIndex: firstToAct,
      minRaise: 2,
      handHistory: [...state.handHistory, `--- ${nextRound} ---`],
    });

    get().addAdvice(`--- ${nextRound} ---`, 'STREET');
  },

  evaluateShowdown: () => {
    const state = get();
    const activePlayers = state.players.filter(p => !p.hasFolded);
    const holeCards = activePlayers.map(p => p.cards);
    
    // Evaluate winners
    const { winnerIndices } = PokerEvaluator.getWinners(holeCards, state.communityCards);
    const winningIds = winnerIndices.map(idx => activePlayers[idx].id);

    // Calculate win amount
    const winAmount = state.pot / winningIds.length;
    
    // Give pot to winner(s)
    const players = [...state.players];
    players.forEach(p => {
      if (winningIds.includes(p.id)) {
        p.stack += winAmount;
      }
    });

    // Populate detailed showdown results
    const showdownResults = activePlayers.map((p, idx) => {
      const evalResult = PokerEvaluator.evaluate(p.cards, state.communityCards);
      const isWinner = winningIds.includes(p.id);
      return {
        id: p.id,
        name: p.name,
        cards: p.cards,
        handName: evalResult.name,
        handDescr: evalResult.descr,
        isWinner,
        winAmount: isWinner ? winAmount : 0
      };
    });

    const winnersList = winningIds.map(id => players.find(p => p.id === id)?.name).join(', ');
    const winningHand = showdownResults.find(r => r.isWinner)?.handName;

    set({ 
      winners: winningIds,
      players,
      showdownResults,
      handHistory: [...state.handHistory, `Showdown: ${winnersList} wins with ${winningHand}!`],
    });

    get().addAdvice(`${winnersList} wins with ${winningHand}!`, 'SYSTEM');
  }

}));

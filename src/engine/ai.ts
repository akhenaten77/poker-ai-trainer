import { GameState, BettingRound } from './game';
import { PokerEvaluator } from './evaluator';
import { Card, toSolverCard } from './deck';

export type AIProfile = 'NIT' | 'TAG' | 'LAG' | 'STATION';

export interface AIAction {
  action: 'FOLD' | 'CHECK' | 'CALL' | 'RAISE';
  amount?: number;
}

/**
 * ─── HAND STRENGTH TIERS ─────────────────────────────────────────────
 * pokersolver rank values:
 *   1 = High Card
 *   2 = Pair
 *   3 = Two Pair
 *   4 = Three of a Kind (Trips/Set)
 *   5 = Straight
 *   6 = Flush
 *   7 = Full House
 *   8 = Four of a Kind (Quads)
 *   9 = Straight Flush
 *  10 = Royal Flush
 */

type PostflopTier = 'monster' | 'very_strong' | 'strong' | 'medium' | 'weak' | 'nothing';

function classifyPostflop(rank: number): PostflopTier {
  if (rank >= 7) return 'monster';       // Full House, Quads, Straight Flush, Royal
  if (rank >= 5) return 'very_strong';   // Straight, Flush
  if (rank >= 4) return 'strong';        // Three of a Kind
  if (rank >= 3) return 'medium';        // Two Pair
  if (rank >= 2) return 'weak';          // One Pair
  return 'nothing';                       // High Card
}

export class PokerAI {
  /**
   * Determine the action for a given bot player based on their profile
   * and the current game state. The bot should play like a real poker
   * player: bet/raise strong hands for value, fold trash, and occasionally
   * bluff.
   */
  static decideAction(state: GameState, playerIndex: number, profile: AIProfile = 'TAG'): AIAction {
    const player = state.players[playerIndex];
    if (!player || !player.isBot || player.hasFolded || player.isAllIn) {
       return { action: 'CHECK' };
    }

    const holeCards = player.cards;
    const communityCards = state.communityCards;
    const toCall = state.currentHighestBet - player.currentBet;
    const potSize = state.pot;
    const rand = Math.random();

    // ─── PROFILE PARAMETERS ──────────────────────────────────────────
    // aggression: how often the bot bets/raises when it has a reason to
    // tightness: how willing the bot is to fold marginal hands
    // bluffFreq: how often the bot will bluff with nothing
    let aggression: number, tightness: number, bluffFreq: number;

    switch (profile) {
      case 'NIT':
        aggression = 0.55; tightness = 0.85; bluffFreq = 0.05;
        break;
      case 'TAG':
        aggression = 0.75; tightness = 0.60; bluffFreq = 0.12;
        break;
      case 'LAG':
        aggression = 0.90; tightness = 0.25; bluffFreq = 0.30;
        break;
      case 'STATION':
        aggression = 0.30; tightness = 0.10; bluffFreq = 0.05;
        break;
      default:
        aggression = 0.65; tightness = 0.50; bluffFreq = 0.10;
    }

    // ─── PREFLOP ─────────────────────────────────────────────────────
    if (communityCards.length === 0) {
      const preflopScore = this.evaluatePreflop(holeCards);
      return this.decidePreflopAction(preflopScore, toCall, potSize, state, aggression, tightness, bluffFreq, rand);
    }

    // ─── POSTFLOP ────────────────────────────────────────────────────
    const evaled = PokerEvaluator.evaluate(holeCards, communityCards);
    const tier = classifyPostflop(evaled.rank);

    return this.decidePostflopAction(tier, evaled.rank, toCall, potSize, state, aggression, tightness, bluffFreq, rand);
  }

  // ─── PREFLOP DECISION ──────────────────────────────────────────────

  private static decidePreflopAction(
    score: number,
    toCall: number,
    potSize: number,
    state: GameState,
    aggression: number,
    tightness: number,
    bluffFreq: number,
    rand: number
  ): AIAction {
    const minRaise = state.currentHighestBet + state.minRaise;

    // Premium hands (AA, KK, QQ, AKs): Always raise
    if (score >= 80) {
      const raiseSize = Math.max(minRaise, state.currentHighestBet * 3);
      return { action: 'RAISE', amount: raiseSize };
    }

    // Strong hands (JJ, TT, AQ, AJs, KQs): Raise most of the time
    if (score >= 55) {
      if (rand < aggression) {
        const raiseSize = Math.max(minRaise, state.currentHighestBet * 2.5);
        return { action: 'RAISE', amount: raiseSize };
      }
      return toCall > 0 ? { action: 'CALL' } : { action: 'CHECK' };
    }

    // Playable hands (mid pairs, suited connectors, broadways): Call or raise sometimes
    if (score >= 35) {
      if (toCall === 0) {
        // No bet to face — raise occasionally for initiative, otherwise check
        if (rand < aggression * 0.4) {
          return { action: 'RAISE', amount: Math.max(minRaise, potSize * 0.75) };
        }
        return { action: 'CHECK' };
      }
      // Facing a bet — call if not too tight
      if (rand > tightness * 0.7) {
        return { action: 'CALL' };
      }
      return { action: 'FOLD' };
    }

    // Marginal/Trash hands
    if (toCall === 0) {
      // Free look — check
      return { action: 'CHECK' };
    }
    // Occasional bluff raise (LAG)
    if (rand < bluffFreq) {
      return { action: 'RAISE', amount: Math.max(minRaise, state.currentHighestBet * 2.5) };
    }
    // Stations will call almost anything
    if (tightness < 0.15 && toCall < potSize * 0.5) {
      return { action: 'CALL' };
    }
    return { action: 'FOLD' };
  }

  // ─── POSTFLOP DECISION ─────────────────────────────────────────────

  private static decidePostflopAction(
    tier: PostflopTier,
    handRank: number,
    toCall: number,
    potSize: number,
    state: GameState,
    aggression: number,
    tightness: number,
    bluffFreq: number,
    rand: number
  ): AIAction {
    const minRaise = state.currentHighestBet + state.minRaise;
    const effectivePot = Math.max(potSize, 1); // avoid division by zero

    switch (tier) {
      // ── MONSTER: Full House+ ──
      // Always bet/raise for maximum value. Occasionally slow-play.
      case 'monster': {
        const slowPlayChance = 0.15; // 15% chance to trap
        if (toCall === 0) {
          if (rand < slowPlayChance) {
            return { action: 'CHECK' }; // Slow-play trap
          }
          // Bet big for value
          const betSize = Math.max(minRaise, Math.round(effectivePot * (0.6 + rand * 0.4)));
          return { action: 'RAISE', amount: betSize };
        }
        // Facing a bet — raise for value
        if (rand < 0.7) {
          const raiseSize = Math.max(minRaise, toCall * 2.5 + Math.round(effectivePot * 0.3));
          return { action: 'RAISE', amount: raiseSize };
        }
        return { action: 'CALL' }; // Sometimes just call to keep them in
      }

      // ── VERY STRONG: Straight / Flush ──
      // Bet for value most of the time. Size bets to get called.
      case 'very_strong': {
        if (toCall === 0) {
          // No bet yet — always lead out for value
          if (rand < 0.85) {
            const betSize = Math.max(minRaise, Math.round(effectivePot * (0.5 + rand * 0.35)));
            return { action: 'RAISE', amount: betSize };
          }
          return { action: 'CHECK' }; // Rare check-raise setup
        }
        // Facing a bet — raise often, always at least call
        if (rand < aggression * 0.8) {
          const raiseSize = Math.max(minRaise, toCall * 2 + Math.round(effectivePot * 0.25));
          return { action: 'RAISE', amount: raiseSize };
        }
        return { action: 'CALL' };
      }

      // ── STRONG: Three of a Kind ──
      // Bet for value, but be cautious on scary boards.
      case 'strong': {
        if (toCall === 0) {
          if (rand < aggression) {
            const betSize = Math.max(minRaise, Math.round(effectivePot * (0.45 + rand * 0.3)));
            return { action: 'RAISE', amount: betSize };
          }
          return { action: 'CHECK' };
        }
        if (rand < aggression * 0.6) {
          const raiseSize = Math.max(minRaise, toCall * 2);
          return { action: 'RAISE', amount: raiseSize };
        }
        return { action: 'CALL' };
      }

      // ── MEDIUM: Two Pair ──
      // Bet for value when checked to. Call raises. Occasionally raise.
      case 'medium': {
        if (toCall === 0) {
          // Two pair is strong enough to bet for value
          if (rand < aggression * 0.8) {
            const betSize = Math.max(minRaise, Math.round(effectivePot * (0.35 + rand * 0.3)));
            return { action: 'RAISE', amount: betSize };
          }
          return { action: 'CHECK' };
        }
        // Facing a bet — call almost always, sometimes raise
        if (rand < aggression * 0.3) {
          const raiseSize = Math.max(minRaise, toCall * 2);
          return { action: 'RAISE', amount: raiseSize };
        }
        return { action: 'CALL' };
      }

      // ── WEAK: One Pair ──
      // Check/call small bets. Fold to big pressure if tight.
      case 'weak': {
        if (toCall === 0) {
          // Bet sometimes for thin value / protection
          if (rand < aggression * 0.45) {
            const betSize = Math.max(minRaise, Math.round(effectivePot * (0.25 + rand * 0.25)));
            return { action: 'RAISE', amount: betSize };
          }
          return { action: 'CHECK' };
        }
        // Facing a bet
        const potOdds = toCall / (effectivePot + toCall);
        if (toCall > effectivePot * 0.6 && tightness > 0.5) {
          return { action: 'FOLD' }; // Tight players fold to big bets with just a pair
        }
        if (tightness < 0.2) {
          return { action: 'CALL' }; // Stations call everything
        }
        if (potOdds < 0.35) {
          return { action: 'CALL' }; // Getting decent odds
        }
        return rand < tightness ? { action: 'FOLD' } : { action: 'CALL' };
      }

      // ── NOTHING: High Card ──
      // Check when free. Bluff occasionally. Fold to bets unless station.
      case 'nothing':
      default: {
        if (toCall === 0) {
          // Bluff bet sometimes
          if (rand < bluffFreq) {
            const betSize = Math.max(minRaise, Math.round(effectivePot * (0.4 + rand * 0.3)));
            return { action: 'RAISE', amount: betSize };
          }
          return { action: 'CHECK' };
        }
        // Facing a bet
        // Stations float with nothing
        if (tightness < 0.15 && toCall < effectivePot * 0.4) {
          return { action: 'CALL' };
        }
        // Occasional bluff-raise
        if (rand < bluffFreq * 0.3) {
          const raiseSize = Math.max(minRaise, toCall * 2.5);
          return { action: 'RAISE', amount: raiseSize };
        }
        return { action: 'FOLD' };
      }
    }
  }

  // ─── PREFLOP HAND STRENGTH (0-100 scale) ───────────────────────────

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
    const high = Math.max(val1, val2);
    const low = Math.min(val1, val2);

    if (isPair) {
      score *= 2.5;
      // Big pairs get extra weight
      if (high >= 12) score += 15; // QQ+
      if (high >= 13) score += 10; // KK+
      if (high >= 14) score += 5;  // AA
    }
    if (isSuited) score += 10;
    
    // Connectivity bonus
    const gap = high - low;
    if (gap === 1) score += 6;
    if (gap === 2) score += 3;

    // Broadway bonus (both cards T+)
    if (high >= 10 && low >= 10) score += 8;

    // Ace kicker bonus
    if (high === 14 && !isPair) score += 5;

    // Normalize to 0-100
    return Math.min(100, (score / 90) * 100);
  }
}

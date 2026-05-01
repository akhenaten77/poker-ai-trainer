/**
 * ─── BOARD TEXTURE ANALYSIS ENGINE ──────────────────────────────────────────
 * Pre-computes board danger signals so the LLM never has to figure out
 * hand strength or board threats from raw card strings.
 */

import { Card } from './deck';
import { PokerEvaluator, EvaluatedHand } from './evaluator';

export interface BoardTexture {
  isPaired: boolean;           // Board has a pair (full house possible)
  isDoublePaired: boolean;     // Board has two pairs
  hasTrips: boolean;           // Board has three of a kind
  isMonotone: boolean;         // All same suit (flush on board)
  hasFlushDraw: boolean;       // 3 of same suit
  hasFlushComplete: boolean;   // 4+ of same suit (flush very likely)
  hasStraightDraw: boolean;    // 3+ connected cards
  hasStraightComplete: boolean;// 4+ connected (straight very likely)
  highCard: string;            // Highest board card
  dangerLevel: 'low' | 'medium' | 'high' | 'extreme';
  threats: string[];           // Human-readable threat descriptions
}

export interface HandContext {
  handName: string;           // "Two Pair", "Full House", etc.
  handRank: number;           // pokersolver rank 1-10
  isVulnerable: boolean;      // Can easily be beaten by common holdings
  beatsWhat: string;          // What hands this beats
  losesTo: string;            // What hands beat this
  usesHoleCards: boolean;     // Whether hole cards contribute to the hand
  boardTexture: BoardTexture;
  recommendation: string;     // Pre-computed action guidance
}

const RANK_ORDER = '23456789TJQKA';

function rankValue(r: string): number {
  return RANK_ORDER.indexOf(r);
}

export function analyzeBoardTexture(communityCards: Card[]): BoardTexture {
  if (!communityCards || communityCards.length === 0) {
    return {
      isPaired: false, isDoublePaired: false, hasTrips: false,
      isMonotone: false, hasFlushDraw: false, hasFlushComplete: false,
      hasStraightDraw: false, hasStraightComplete: false,
      highCard: '', dangerLevel: 'low', threats: []
    };
  }

  const ranks = communityCards.map(c => c.rank);
  const suits = communityCards.map(c => c.suit);
  const threats: string[] = [];

  // ── Pair / Trips detection ──
  const rankCounts: Record<string, number> = {};
  ranks.forEach(r => { rankCounts[r] = (rankCounts[r] || 0) + 1; });
  const pairs = Object.entries(rankCounts).filter(([, c]) => c === 2);
  const trips = Object.entries(rankCounts).filter(([, c]) => c >= 3);
  const isPaired = pairs.length > 0 || trips.length > 0;
  const isDoublePaired = pairs.length >= 2;
  const hasTrips = trips.length > 0;

  if (hasTrips) threats.push('Board has three-of-a-kind — anyone with a pocket pair has a full house');
  else if (isDoublePaired) threats.push('Double-paired board — full house is very likely for opponents');
  else if (isPaired) threats.push('Paired board — full house and trips are possible');

  // ── Flush detection ──
  const suitCounts: Record<string, number> = {};
  suits.forEach(s => { suitCounts[s] = (suitCounts[s] || 0) + 1; });
  const maxSuitCount = Math.max(...Object.values(suitCounts));
  const isMonotone = maxSuitCount >= 3 && communityCards.length === 3;
  const hasFlushDraw = maxSuitCount === 3;
  const hasFlushComplete = maxSuitCount >= 4;

  if (hasFlushComplete) threats.push('Four cards of the same suit on board — flush is extremely likely');
  else if (hasFlushDraw) threats.push('Three cards of the same suit — flush draw present');

  // ── Straight detection ──
  const uniqueRankVals = [...new Set(ranks.map(r => rankValue(r)))].sort((a, b) => a - b);
  // Add low-ace for wheel
  if (uniqueRankVals.includes(12)) uniqueRankVals.unshift(-1);
  
  let maxConsecutive = 1;
  let currentConsecutive = 1;
  for (let i = 1; i < uniqueRankVals.length; i++) {
    if (uniqueRankVals[i] - uniqueRankVals[i - 1] === 1) {
      currentConsecutive++;
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    } else if (uniqueRankVals[i] - uniqueRankVals[i - 1] > 1) {
      currentConsecutive = 1;
    }
  }
  const hasStraightDraw = maxConsecutive >= 3;
  const hasStraightComplete = maxConsecutive >= 4;

  if (hasStraightComplete) threats.push('Four connected cards — straight is very likely');
  else if (hasStraightDraw) threats.push('Three connected cards — straight draws present');

  // ── High card ──
  const sortedRanks = [...ranks].sort((a, b) => rankValue(b) - rankValue(a));
  const highCard = sortedRanks[0];

  // ── Danger level ──
  let dangerLevel: 'low' | 'medium' | 'high' | 'extreme' = 'low';
  const dangerScore = (isPaired ? 2 : 0) + (isDoublePaired ? 2 : 0) + (hasTrips ? 3 : 0) +
    (hasFlushComplete ? 3 : 0) + (hasFlushDraw ? 1 : 0) +
    (hasStraightComplete ? 3 : 0) + (hasStraightDraw ? 1 : 0);
  
  if (dangerScore >= 5) dangerLevel = 'extreme';
  else if (dangerScore >= 3) dangerLevel = 'high';
  else if (dangerScore >= 1) dangerLevel = 'medium';

  return {
    isPaired, isDoublePaired, hasTrips,
    isMonotone, hasFlushDraw, hasFlushComplete,
    hasStraightDraw, hasStraightComplete,
    highCard, dangerLevel, threats
  };
}

/**
 * Checks if the bot's hand meaningfully uses its hole cards.
 * A "Two Pair" where both pairs are on the board is basically nothing.
 */
function checkHoleCardContribution(
  holeCards: Card[],
  communityCards: Card[],
  evalResult: EvaluatedHand
): { usesHoleCards: boolean; detail: string } {
  const holeRanks = holeCards.map(c => c.rank);
  const boardRanks = communityCards.map(c => c.rank);
  
  const boardRankCounts: Record<string, number> = {};
  boardRanks.forEach(r => { boardRankCounts[r] = (boardRankCounts[r] || 0) + 1; });

  // For Two Pair: check if both pairs exist on the board
  if (evalResult.rank === 3) { // Two Pair
    const boardPairs = Object.entries(boardRankCounts).filter(([, c]) => c >= 2).map(([r]) => r);
    if (boardPairs.length >= 2) {
      // Both pairs are on the board — hole cards are irrelevant kickers
      const holeContributes = holeRanks.some(hr => boardPairs.includes(hr) && boardRankCounts[hr] === 1);
      if (!holeContributes) {
        return { usesHoleCards: false, detail: 'Both pairs are on the board — your hand is effectively just a kicker' };
      }
    }
    // Check if at least one hole card matches a board card to form a pair
    const holeMatchesBoard = holeRanks.some(hr => boardRanks.includes(hr));
    if (!holeMatchesBoard && boardPairs.length >= 2) {
      return { usesHoleCards: false, detail: 'Two Pair is entirely on the board — every player has this' };
    }
  }

  // For One Pair: check if the pair is on the board
  if (evalResult.rank === 2) {
    const boardPairs = Object.entries(boardRankCounts).filter(([, c]) => c >= 2);
    const holeFormedPair = holeRanks[0] === holeRanks[1]; // Pocket pair
    const holeMatchesBoard = holeRanks.some(hr => boardRanks.includes(hr));
    if (boardPairs.length > 0 && !holeFormedPair && !holeMatchesBoard) {
      return { usesHoleCards: false, detail: 'The pair is on the board — every player has at least a pair' };
    }
  }

  // For Full House: check if it's board-made
  if (evalResult.rank === 7) {
    const boardTrips = Object.entries(boardRankCounts).filter(([, c]) => c >= 3);
    const boardPairs = Object.entries(boardRankCounts).filter(([, c]) => c >= 2);
    if (boardTrips.length > 0 && boardPairs.length >= 2) {
      // Full house on board
      const holeImproves = holeRanks.some(hr => boardRankCounts[hr] && boardRankCounts[hr] >= 2);
      if (!holeImproves) {
        return { usesHoleCards: false, detail: 'Full House is on the board — any higher card wins' };
      }
    }
  }

  return { usesHoleCards: true, detail: 'Hole cards contribute to hand strength' };
}

export function buildHandContext(
  holeCards: Card[],
  communityCards: Card[],
): HandContext {
  const boardTexture = analyzeBoardTexture(communityCards);

  if (!communityCards || communityCards.length === 0) {
    return {
      handName: 'Preflop',
      handRank: 0,
      isVulnerable: false,
      beatsWhat: '',
      losesTo: '',
      usesHoleCards: true,
      boardTexture,
      recommendation: 'Use preflop hand strength charts'
    };
  }

  const evalResult = PokerEvaluator.evaluate(holeCards, communityCards);
  const { usesHoleCards, detail } = checkHoleCardContribution(holeCards, communityCards, evalResult);

  // ── Vulnerability analysis ──
  let isVulnerable = false;
  let beatsWhat = '';
  let losesTo = '';
  let recommendation = '';

  switch (evalResult.rank) {
    case 1: // High Card
      isVulnerable = true;
      beatsWhat = 'Nothing — only wins if everyone else has worse kickers';
      losesTo = 'Any pair or better';
      recommendation = 'This hand has almost no showdown value. Fold to any significant bet unless bluffing.';
      break;
    case 2: // One Pair
      isVulnerable = true;
      beatsWhat = 'High card hands';
      losesTo = 'Two pair, trips, straights, flushes, full houses, quads';
      recommendation = boardTexture.isPaired 
        ? 'One pair on a paired board is very weak. Opponents likely have trips or better. Fold to aggression.'
        : 'One pair is marginal. Check/call small bets only, fold to large bets.';
      break;
    case 3: // Two Pair
      isVulnerable = true;
      if (!usesHoleCards) {
        beatsWhat = 'Nothing significant — this two pair is on the board for everyone';
        losesTo = 'Anyone with a card that makes trips, a full house, or better kicker';
        recommendation = 'YOUR TWO PAIR IS ON THE BOARD — every player has this. Your hand is effectively just your kicker. Fold to any significant bet.';
      } else {
        beatsWhat = 'High card, one pair';
        losesTo = 'Trips, straights, flushes, full houses, quads';
        recommendation = boardTexture.isPaired
          ? 'Two pair on a paired board is VERY dangerous — full house is extremely likely for opponents. Fold to large bets.'
          : 'Two pair is decent but vulnerable. Bet for value on safe boards, but fold to heavy raises on wet boards.';
      }
      break;
    case 4: // Three of a Kind
      isVulnerable = boardTexture.hasFlushDraw || boardTexture.hasStraightDraw;
      beatsWhat = 'High card, pairs, two pair';
      losesTo = 'Straights, flushes, full houses, quads';
      recommendation = boardTexture.isPaired
        ? 'Trips when the board is paired means opponents could also have trips or a full house. Play cautiously.'
        : 'Trips is strong. Bet for value, but watch for straight and flush completions.';
      break;
    case 5: // Straight
      isVulnerable = boardTexture.hasFlushDraw || boardTexture.hasFlushComplete;
      beatsWhat = 'High card, pairs, two pair, trips';
      losesTo = 'Flushes, full houses, quads';
      recommendation = boardTexture.isPaired
        ? 'Straight on a paired board — full house beats you. Be cautious with large bets.'
        : boardTexture.hasFlushDraw
          ? 'Straight with flush draw on board — if flush completes you lose. Bet now for value.'
          : 'Strong hand. Bet for value.';
      break;
    case 6: // Flush
      isVulnerable = boardTexture.isPaired;
      beatsWhat = 'Everything below flush';
      losesTo = 'Full houses, quads, higher flushes';
      recommendation = boardTexture.isPaired
        ? 'Flush on a paired board — full house is possible. Proceed with caution against big raises.'
        : 'Very strong hand. Bet aggressively for value.';
      break;
    case 7: // Full House
      isVulnerable = false;
      beatsWhat = 'Everything below full house';
      losesTo = 'Higher full houses, quads';
      recommendation = usesHoleCards 
        ? 'Monster hand! Bet big for maximum value. Slow-play only if you want to trap.'
        : 'Full house but board-made — opponents may have a HIGHER full house. Play cautiously.';
      break;
    case 8: // Quads
      isVulnerable = false;
      beatsWhat = 'Everything except higher quads or straight flush';
      losesTo = 'Almost nothing';
      recommendation = 'Near-unbeatable hand. Extract maximum value — slow-play or bet big.';
      break;
    default: // Straight Flush, Royal
      isVulnerable = false;
      beatsWhat = 'Everything';
      losesTo = 'Nothing practical';
      recommendation = 'The nuts. Get all your chips in.';
  }

  if (!usesHoleCards && evalResult.rank <= 3) {
    recommendation = `WARNING: ${detail}. ${recommendation}`;
    isVulnerable = true;
  }

  return {
    handName: evalResult.name,
    handRank: evalResult.rank,
    isVulnerable,
    beatsWhat,
    losesTo,
    usesHoleCards,
    boardTexture,
    recommendation
  };
}

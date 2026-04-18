export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export class Deck {
  private cards: Card[] = [];

  constructor() {
    this.initialize();
  }

  public initialize() {
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    
    this.cards = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        this.cards.push({ suit, rank });
      }
    }
  }

  public shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  public draw(): Card | undefined {
    return this.cards.pop();
  }

  public drawMany(count: number): Card[] {
    const drawn: Card[] = [];
    for (let i = 0; i < count; i++) {
      const card = this.draw();
      if (card) drawn.push(card);
    }
    return drawn;
  }

  public get remaining(): number {
    return this.cards.length;
  }
}

// Utility to convert our Card to pokersolver string representation
export function toSolverCard(card: Card): string {
  const suitChar = card.suit.charAt(0).toLowerCase(); // h, d, c, s
  return `${card.rank}${suitChar}`;
}

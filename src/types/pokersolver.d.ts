declare module 'pokersolver' {
  export namespace Hand {
    export function solve(cards: string[]): any;
    export function winners(hands: any[]): any[];
  }
}

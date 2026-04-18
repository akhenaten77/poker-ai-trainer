import React from 'react';
import { Card as CardType } from '../engine/deck';

interface PlayingCardProps {
  card?: CardType;
  hidden?: boolean;
}

export function PlayingCard({ card, hidden }: PlayingCardProps) {
  // If no card is passed, or it is explicitly hidden, we show the card back.
  const isHidden = hidden || !card;

  const isRed = card?.suit === 'hearts' || card?.suit === 'diamonds';
  // Use a definitive red for hearts/diamonds and true gray-900 instead of pure black for modern contrast
  const colorClass = isRed ? 'text-red-500' : 'text-gray-900';
    
  let suitChar = '';
  if (card) {
    if (card.suit === 'hearts') suitChar = '♥';
    if (card.suit === 'diamonds') suitChar = '♦';
    if (card.suit === 'clubs') suitChar = '♣';
    if (card.suit === 'spades') suitChar = '♠';
  }

  const isFaceCard = card?.rank === 'J' || card?.rank === 'Q' || card?.rank === 'K';
  const displayRank = card?.rank === 'T' ? '10' : card?.rank;

  // Realistic geometric pattern for the deck's card back
  const backPatternStyle = {
    backgroundImage: `
      linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1)), 
      linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1))
    `,
    backgroundSize: '10px 10px',
    backgroundPosition: '0 0, 5px 5px'
  };

  return (
    <div 
      className="relative w-14 h-20 sm:w-[4.5rem] sm:h-[6.5rem] cursor-default transition-transform duration-300 hover:-translate-y-1 hover:drop-shadow-lg drop-shadow-md group"
      style={{ perspective: '800px' }}
    >
      <div 
        className="w-full h-full relative transition-transform duration-500 ease-out"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: isHidden ? 'rotateY(0deg)' : 'rotateY(180deg)'
        }}
      >
        {/* Card Back (Visible when isHidden is true - Y rotation is 0deg) */}
        <div 
          className="absolute inset-0 w-full h-full rounded border-2 border-white bg-gradient-to-br from-blue-800 to-purple-900 overflow-hidden shadow-sm p-1"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Inner rectangle common on deck backs */}
          <div className="w-full h-full border border-white/30 rounded-sm bg-black/10">
             <div className="w-full h-full opacity-30" style={backPatternStyle}></div>
          </div>
        </div>

        {/* Card Front (Visible when isHidden is false - container rotates 180, bringing the front 180 rotation to 360 = 0deg) */}
        <div 
          className={`absolute inset-0 w-full h-full rounded border border-gray-300 bg-white flex flex-col p-1 sm:p-1.5 shadow-sm ${colorClass}`}
          style={{ 
            backfaceVisibility: 'hidden', 
            transform: 'rotateY(180deg)' 
          }}
        >
          {card && (
            <>
              {/* Top-left Indicator */}
              <div className="flex flex-col items-center leading-none self-start w-4 sm:w-5">
                <span className="font-bold text-[12px] sm:text-[14px] tracking-tighter -mb-0.5">{displayRank}</span>
                <span className="text-[12px] sm:text-[14px] leading-tight">{suitChar}</span>
              </div>

              {/* Center Graphic */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 {isFaceCard ? (
                   <div className="flex items-center justify-center px-1.5 sm:px-2 py-0.5 border-2 border-current rounded opacity-90 mx-3">
                      <span className="font-black text-xl sm:text-2xl font-serif mr-0.5">{displayRank}</span>
                      <span className="text-lg sm:text-xl">{suitChar}</span>
                   </div>
                 ) : (
                   <span className="text-3xl sm:text-5xl opacity-90">{suitChar}</span>
                 )}
              </div>

              {/* Bottom-right Indicator (Mirrored) */}
              <div className="flex flex-col items-center leading-none self-end rotate-180 w-4 sm:w-5 mt-auto">
                <span className="font-bold text-[12px] sm:text-[14px] tracking-tighter -mb-0.5">{displayRank}</span>
                <span className="text-[12px] sm:text-[14px] leading-tight">{suitChar}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

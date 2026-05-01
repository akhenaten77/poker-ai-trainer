'use client';

import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Card as CardType } from '../engine/deck';

interface PlayingCardProps {
  card?: CardType;
  hidden?: boolean;
  /** Stagger delay in ms for dealing animation */
  dealDelay?: number;
}

/**
 * Maps our internal Card type to a filename in /assets/cards/.
 * Card rank 'T' maps to 'T', face cards J/Q/K/A stay as-is.
 * Suit maps: hearts→h, diamonds→d, clubs→c, spades→s
 *
 * Examples:
 *   { rank: 'A', suit: 'hearts' }   → "Ah"
 *   { rank: 'T', suit: 'spades' }   → "Ts"
 *   { rank: '5', suit: 'diamonds' }  → "5d"
 */
function getCardFilename(card: CardType): string {
  const suitMap: Record<string, string> = {
    hearts: 'h',
    diamonds: 'd',
    clubs: 'c',
    spades: 's',
  };
  return `${card.rank}${suitMap[card.suit] || 's'}`;
}

export function PlayingCard({ card, hidden, dealDelay = 0 }: PlayingCardProps) {
  const isHidden = hidden || !card;
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, scale: 1 });
  const [dealt, setDealt] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const prevHiddenRef = useRef(isHidden);

  // Random slight rotation for dealing effect (±3 degrees)
  const randomRotate = useMemo(() => (Math.random() * 6 - 3).toFixed(1), []);

  // Deal-in animation with stagger
  useEffect(() => {
    const timer = setTimeout(() => setDealt(true), 50 + dealDelay);
    return () => clearTimeout(timer);
  }, [dealDelay]);

  // Detect flip transitions (hidden→revealed)
  useEffect(() => {
    if (prevHiddenRef.current && !isHidden) {
      setFlipping(true);
      const timer = setTimeout(() => setFlipping(false), 400);
      return () => clearTimeout(timer);
    }
    prevHiddenRef.current = isHidden;
  }, [isHidden]);

  // ─── 3D PARALLAX TILT ──────────────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Normalize to -1..1 range, then scale to max tilt degrees
    const maxTilt = 12;
    const rotateY = (mouseX / (rect.width / 2)) * maxTilt;
    const rotateX = -(mouseY / (rect.height / 2)) * maxTilt;

    setTilt({ rotateX, rotateY, scale: 1.05 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0, scale: 1 });
  }, []);

  return (
    <div
      ref={cardRef}
      className={`playing-card relative w-14 h-20 sm:w-[4.5rem] sm:h-[6.5rem] cursor-default group
        ${!dealt ? 'opacity-0 translate-y-8 scale-75' : 'opacity-100 translate-y-0 scale-100'}`}
      style={{
        perspective: '1000px',
        transition: !dealt
          ? 'none'
          : 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        transitionDelay: !dealt ? '0ms' : `${dealDelay}ms`,
        '--deal-rotate': `${randomRotate}deg`,
      } as any}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Tilt wrapper — handles the 3D parallax */}
      <div
        className="w-full h-full"
        style={{
          transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.scale})`,
          transition: 'transform 0.15s ease-out',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Flip wrapper — handles the card reveal rotation */}
        <div
          className="w-full h-full relative"
          style={{
            transformStyle: 'preserve-3d',
            transform: isHidden ? 'rotateY(0deg)' : 'rotateY(180deg)',
            transition: 'transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)',
          }}
        >
          {/* ── Card Back ── */}
          <div
            className="absolute inset-0 w-full h-full rounded-lg overflow-hidden card-face-shadow"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <Image
              src="/assets/cards/back.png"
              alt="Card back"
              fill
              sizes="(max-width: 640px) 56px, 72px"
              className="object-cover rounded-lg"
              priority
            />
            {/* Texture overlay */}
            <div className="card-noise rounded-lg" />
            {/* Specular highlight */}
            <div className="card-specular rounded-lg" />
            {/* Thin edge simulation (visible during mid-flip) */}
            <div className="absolute inset-y-0 -right-[1px] w-[2px] bg-gradient-to-b from-gray-400 via-gray-300 to-gray-400 opacity-40" />
          </div>

          {/* ── Card Front ── */}
          <div
            className="absolute inset-0 w-full h-full rounded-lg overflow-hidden card-face-shadow"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {card && (
              <>
                <Image
                  src={`/assets/cards/${getCardFilename(card)}.png`}
                  alt={`${card.rank} of ${card.suit}`}
                  fill
                  sizes="(max-width: 640px) 56px, 72px"
                  className="object-cover rounded-lg"
                  priority
                />
                {/* Texture overlay */}
                <div className="card-noise rounded-lg" />
                {/* Specular highlight */}
                <div className="card-specular rounded-lg" />
                {/* Thin edge simulation */}
                <div className="absolute inset-y-0 -left-[1px] w-[2px] bg-gradient-to-b from-gray-400 via-gray-300 to-gray-400 opacity-40" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useMemo } from 'react';

interface PokerChipProps {
  /** Chip denomination for color coding */
  value: 1 | 5 | 10 | 25 | 50 | 100;
  /** Vertical offset in a stack (px) */
  stackOffset?: number;
  /** Delay before the chip appears */
  animDelay?: number;
  /** Whether the chip should animate in from a direction */
  animateIn?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
}

const CHIP_COLORS: Record<number, { bg: string; ring: string; edge: string; label: string }> = {
  1:   { bg: '#e5e7eb', ring: '#9ca3af', edge: '#6b7280', label: '#111827' },   // white/gray
  5:   { bg: '#ef4444', ring: '#dc2626', edge: '#991b1b', label: '#fef2f2' },   // red
  10:  { bg: '#3b82f6', ring: '#2563eb', edge: '#1e40af', label: '#eff6ff' },   // blue
  25:  { bg: '#22c55e', ring: '#16a34a', edge: '#166534', label: '#f0fdf4' },   // green
  50:  { bg: '#0d0d0d', ring: '#404040', edge: '#000000', label: '#f9fafb' },   // black
  100: { bg: '#a855f7', ring: '#9333ea', edge: '#6b21a8', label: '#faf5ff' },   // purple
};

export function PokerChip({ value, stackOffset = 0, animDelay = 0, animateIn = false, size = 'md' }: PokerChipProps) {
  const colors = CHIP_COLORS[value] || CHIP_COLORS[1];
  const dim = size === 'sm' ? 28 : 36;

  return (
    <div
      className={`poker-chip absolute ${animateIn ? 'animate-chip-in' : ''}`}
      style={{
        width: dim,
        height: dim,
        bottom: stackOffset,
        animationDelay: `${animDelay}ms`,
      }}
    >
      {/* Chip body */}
      <div
        className="w-full h-full rounded-full relative"
        style={{
          background: `radial-gradient(circle at 35% 35%, ${colors.bg} 0%, ${colors.ring} 100%)`,
          boxShadow: `
            0 ${Math.max(2, stackOffset > 0 ? 1 : 3)}px ${stackOffset > 0 ? 2 : 6}px rgba(0,0,0,0.5),
            inset 0 1px 2px rgba(255,255,255,0.3),
            inset 0 -1px 2px rgba(0,0,0,0.2)
          `,
          border: `2px solid ${colors.ring}`,
        }}
      >
        {/* Dashed ring (like casino chip edge markings) */}
        <div
          className="absolute inset-[3px] rounded-full"
          style={{
            border: `2px dashed rgba(255,255,255,0.35)`,
          }}
        />
        {/* Center label */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            color: colors.label,
            fontSize: size === 'sm' ? 8 : 10,
            fontWeight: 900,
            textShadow: '0 1px 1px rgba(0,0,0,0.3)',
            fontFamily: 'var(--font-display)',
          }}
        >
          {value}
        </div>
        {/* 3D edge illusion — bottom arc */}
        <div
          className="absolute -bottom-[2px] left-[10%] right-[10%] h-[3px] rounded-b-full"
          style={{ background: colors.edge }}
        />
      </div>
    </div>
  );
}

// ─── CHIP STACK ─────────────────────────────────────────────────────

interface ChipStackProps {
  /** Total amount to represent */
  amount: number;
  /** Whether chips should animate in */
  animate?: boolean;
  /** Direction chips animate from */
  size?: 'sm' | 'md';
}

/** Break an amount into chip denominations */
function decompose(amount: number): number[] {
  const denoms = [100, 50, 25, 10, 5, 1];
  const chips: number[] = [];
  let remaining = Math.round(amount);

  // Cap at 12 chips for visual cleanliness
  for (const d of denoms) {
    while (remaining >= d && chips.length < 12) {
      chips.push(d);
      remaining -= d;
    }
  }
  return chips;
}

export function ChipStack({ amount, animate = false, size = 'md' }: ChipStackProps) {
  const chips = useMemo(() => decompose(amount), [amount]);
  const chipHeight = size === 'sm' ? 4 : 5;

  if (amount <= 0) return null;

  return (
    <div className="relative inline-flex" style={{ width: size === 'sm' ? 28 : 36, height: chips.length * chipHeight + (size === 'sm' ? 28 : 36) }}>
      {chips.map((val, i) => (
        <PokerChip
          key={i}
          value={val as any}
          stackOffset={i * chipHeight}
          animDelay={animate ? i * 40 : 0}
          animateIn={animate}
          size={size}
        />
      ))}
    </div>
  );
}

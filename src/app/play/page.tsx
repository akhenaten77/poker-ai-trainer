"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useGameStore } from "../../store/gameStore";
import { PlayingCard } from "../../components/PlayingCard";
import { PokerAI, AIProfile } from "../../engine/ai";

export default function PlayPage() {
  const store = useGameStore();

  useEffect(() => {
    // Initialize game with 4 bots and 100BB stack
    store.initializeGame("HERO", 5, 2000, "Medium");
  }, []); // Run once on mount

  // Auto-Act Loop for Bots
  useEffect(() => {
    if (!store.players.length || store.winners.length > 0) return;
    
    const currentPlayer = store.players[store.currentPlayerIndex];
    if (currentPlayer && currentPlayer.isBot) {
      // Assign profiles loosely based on index
      const profiles: AIProfile[] = ['TAG', 'NIT', 'LAG', 'STATION'];
      const profile = profiles[(store.currentPlayerIndex - 1) % profiles.length];

      const timer = setTimeout(() => {
        const action = PokerAI.decideAction(store, store.currentPlayerIndex, profile);
        store.playerAction(action.action, action.amount);
      }, 1500); // 1.5s delay for realism

      return () => clearTimeout(timer);
    }
  }, [store.currentPlayerIndex, store.currentRound, store.players, store.winners]);

  if (!store.players.length) return <div className="h-screen w-screen flex items-center justify-center bg-surface text-white">Loading...</div>;

  const hero = store.players[0]; // Hero is ID 0
  const bots = store.players.slice(1);
  const { communityCards, pot, currentHighestBet, currentRound, handHistory } = store;

  // Render community cards placeholders (up to 5)
  const renderCommunityCards = () => {
    const cards = [];
    for (let i = 0; i < 5; i++) {
      if (communityCards[i]) {
        cards.push(<PlayingCard key={i} card={communityCards[i]} />);
      } else {
        cards.push(<PlayingCard key={i} hidden />);
      }
    }
    return cards;
  };

  const handleAction = (action: 'FOLD' | 'CHECK' | 'CALL' | 'RAISE') => {
    // Basic amount, would normally come from slider, let's hardcode pot raise for test
    store.playerAction(action, store.pot);
  };

  return (
    <div className="bg-surface-dim text-on-surface overflow-hidden h-screen w-screen flex flex-col font-body">
      {/* TopAppBar */}
      <header className="bg-[#131313] flex justify-between items-center px-6 py-4 w-full z-50 docked full-width top-0 border-b border-outline-variant/10">
        <div className="text-xl font-black text-[#39FF14] tracking-tighter font-headline">
          OBSIDIAN INTELLECT
        </div>
        <nav className="hidden md:flex gap-8 items-center">
          <a className="font-headline font-bold tracking-tight text-[#39FF14] border-b-2 border-[#39FF14] pb-1" href="#">Live Practice</a>
          <a className="font-headline font-bold tracking-tight text-[#BACCB0] hover:text-[#E5E2E1] transition-colors duration-300" href="/review">Hand Review</a>
          <a className="font-headline font-bold tracking-tight text-[#BACCB0] hover:text-[#E5E2E1] transition-colors duration-300" href="/analytics">Analytics</a>
        </nav>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-[#2A2A2A] transition-colors duration-300 text-[#39FF14]">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </button>
          <button className="p-2 rounded-full hover:bg-[#2A2A2A] transition-colors duration-300 text-[#BACCB0]">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEP5dUACFoutpvmn62yPG14c5qxvJjwYHdxrcQdPssJBboib_XW000MFx8X2v1wvvcOsDeNhJhHWluK0VzjP22VXpBOkt949aR5P-lvrxXK2-pcMZHoiUo7Mcc5UVm_O1x3dz0IIukY8XZKpyM3j9-dZvNpwFVwhSQJSaQoWalWD8m6xbQK8dmaNKVKjoPKF3NtRaY-7vOBqQiOJQo2TuplrrrbY1SFHtgeSyejpER4WLuAwLhQZsfdWXzJHf3cLLlgRrJCdnODtQ" alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        {/* SideNavBar */}
        <aside className="fixed left-0 top-0 h-full flex flex-col z-40 bg-[#1C1B1B] w-64 shadow-[20px_0_40px_rgba(0,0,0,0.4)] hidden lg:flex border-r border-[#2A2A2A]">
          <div className="p-6 pt-24">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center border border-primary-container/20">
                <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              </div>
              <div>
                <div className="font-headline text-[#39FF14] font-bold">AI Coach</div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-widest">Elite Intellect Active</div>
              </div>
            </div>
            <nav className="space-y-1">
              <a className="flex items-center gap-3 text-[#BACCB0] px-4 py-3 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all font-body font-medium text-sm" href="#"><span className="material-symbols-outlined">dashboard</span> Dashboard</a>
              <a className="flex items-center gap-3 bg-[#2A2A2A] text-[#39FF14] rounded-lg px-4 py-3 border-l-4 border-[#39FF14] font-body font-medium text-sm" href="#"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span> Training</a>
              <a className="flex items-center gap-3 text-[#BACCB0] px-4 py-3 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all font-body font-medium text-sm" href="/review"><span className="material-symbols-outlined">history</span> Hand History</a>
              <a className="flex items-center gap-3 text-[#BACCB0] px-4 py-3 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all font-body font-medium text-sm" href="/coach"><span className="material-symbols-outlined">grid_view</span> Range Lab</a>
              <a className="flex items-center gap-3 text-[#BACCB0] px-4 py-3 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all font-body font-medium text-sm" href="/analytics"><span className="material-symbols-outlined">analytics</span> AI Insights</a>
            </nav>
          </div>
        </aside>

        {/* Main Canvas */}
        <main className="lg:ml-64 flex-1 relative flex flex-col items-center justify-center p-8 bg-surface-dim">
          {/* Poker Table */}
          <div className="relative w-full max-w-5xl aspect-[21/9] poker-felt rounded-[200px] border-[12px] border-[#1C1B1B] neon-rim flex flex-col items-center justify-center">
            {/* Center Area: Pot & Community Cards */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {/* Pot Size */}
              <div className="bg-black/40 backdrop-blur-md px-6 py-2 rounded-full mb-6 border border-primary-container/20 flex flex-col items-center">
                <span className="text-on-surface-variant text-[10px] uppercase tracking-widest font-headline">Total Pot</span>
                <span className="text-primary-container font-black text-2xl font-headline drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]">
                  {pot.toFixed(1)} BB
                </span>
                <span className="text-white text-[10px] bg-white/10 px-2 rounded mt-1">{currentRound}</span>
              </div>
              {/* Community Cards */}
              <div className="flex gap-3">
                {renderCommunityCards()}
              </div>
            </div>

            {/* Players (Seats) Dynamically positioned */}
            {bots.map((bot, idx) => {
              // Distribute 4 bots around the table
              const positions = [
                "top-0 left-1/4 -translate-y-1/2", // Bot 1
                "top-0 right-1/4 -translate-y-1/2", // Bot 2
                "right-0 top-1/2 translate-x-1/2 -translate-y-1/2", // Bot 3
                "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2", // Bot 4
              ];
              const isActive = store.currentPlayerIndex === idx + 1;

              return (
                <div key={bot.id} className={`absolute ${positions[idx]} flex flex-col items-center pointer-events-none transition-all ${isActive ? 'scale-110' : ''}`}>
                  <div className={`bg-surface-container-high rounded-2xl p-2 border ${isActive ? 'border-primary-container shadow-[0_0_15px_rgba(57,255,20,0.4)]' : 'border-outline-variant'} w-28 text-center shadow-lg transition-all`}>
                    <div className="w-10 h-10 rounded-full bg-surface-container-lowest mx-auto mb-1 border-2 border-surface-dim flex items-center justify-center">
                      <span className="material-symbols-outlined text-outline-variant">robot_2</span>
                    </div>
                    <div className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">{bot.name}</div>
                    <div className="text-xs font-bold text-white">{bot.stack.toFixed(1)} BB</div>
                  </div>
                  {bot.hasFolded ? (
                    <div className="mt-2 bg-error-container text-error px-3 py-1 rounded-full text-[10px] font-bold">FOLDED</div>
                  ) : (
                    <div className="mt-2 bg-black/60 px-3 py-1 rounded-full text-[10px] text-primary-fixed-dim border border-primary-fixed-dim/30">
                      Bet: {bot.currentBet.toFixed(1)}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Bottom Center: Hero (User) */}
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex flex-col items-center z-10 transition-all ${store.currentPlayerIndex === 0 ? 'scale-110' : ''}`}>
              {/* Hero Cards */}
              <div className="flex gap-1 mb-2 relative">
                {hero.cards.map((card, i) => (
                   <div key={i} className={`rotate-[${i%2===0?'-4':'4'}deg]`}>
                     <PlayingCard card={card} />
                   </div>
                ))}
              </div>
              {/* Hero Info */}
              <div className={`bg-primary-container rounded-2xl p-2 border-4 ${store.currentPlayerIndex === 0 ? 'border-white shadow-[0_0_30px_rgba(57,255,20,0.8)]' : 'border-surface-container-high shadow-2xl'} w-32 text-center transition-all`}>
                <div className="text-[10px] text-on-primary font-black uppercase tracking-tighter">YOU (HERO)</div>
                <div className="text-sm font-black text-on-primary">{hero.stack.toFixed(1)} BB</div>
                <div className="text-[10px] font-bold text-on-primary/70 mt-1 bg-black/10 rounded">Bet: {hero.currentBet}</div>
              </div>
            </div>
          </div>

           {/* AI Quick Insights Panel */}
           <div className="absolute right-8 top-24 w-80 flex flex-col gap-4 pointer-events-none hidden xl:flex">
             {/* Coaching Feedback Container */}
             {store.coachAdvices.length > 0 && (
               <div className="glass-panel p-4 rounded-2xl border border-[#39FF14]/50 shadow-[0_0_15px_rgba(57,255,20,0.2)] bg-[#0E0E0E]/80 backdrop-blur-xl animate-fade-in">
                 <div className="flex items-center gap-2 mb-1">
                   <span className="material-symbols-outlined text-sm text-[#39FF14]">lightbulb</span>
                   <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Live Coach</span>
                 </div>
                 <p className="text-xs text-white leading-relaxed">
                   {store.coachAdvices[store.coachAdvices.length - 1].text}
                 </p>
               </div>
             )}

             <div className="glass-panel p-6 rounded-3xl border border-primary-container/20 overflow-hidden relative shadow-2xl bg-[#0E0E0E]/60 backdrop-blur-xl">
               <div className="flex items-center gap-2 mb-2 relative">
                 <span className="material-symbols-outlined text-primary-container">psychology</span>
                 <h3 className="font-headline font-bold text-sm tracking-widest uppercase text-white">Live History</h3>
               </div>
               <div className="space-y-1 h-48 overflow-y-auto mt-4 text-xs font-mono text-on-surface-variant">
                 {handHistory.map((log, i) => (
                   <div key={i} className={log.includes('---') ? 'text-primary-container font-bold pt-2' : ''}>
                     {log}
                   </div>
                 ))}
               </div>
             </div>
             {store.winners.length > 0 && (
                <div className="bg-primary-container text-on-primary p-4 rounded-xl font-bold font-headline shadow-[0_0_20px_rgba(57,255,20,0.4)]">
                   Winners: {store.winners.join(', ')}
                   <br/>
                   <button onClick={() => store.startHand()} className="mt-2 text-xs bg-black/20 px-3 py-1 rounded hover:bg-black/30 w-full uppercase">Next Hand</button>
                </div>
             )}
          </div>

          {/* Bottom Control Panel */}
          <div className="absolute bottom-6 mx-auto flex flex-col md:flex-row justify-center items-end gap-6 w-full max-w-4xl px-4 pointer-events-auto">
            {/* Bet Sizing */}
            <div className="bg-[#0e0e0e]/60 backdrop-blur-xl rounded-2xl p-4 flex flex-col gap-3 w-64 border border-outline-variant/20 shadow-2xl shrink-0">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Raise / Bet</span>
                <span className="text-primary-container font-headline font-bold">12.5 BB</span>
              </div>
              <input className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary-container" type="range" defaultValue={12.5} min={0} max={hero.stack} />
              <div className="grid grid-cols-5 gap-1">
                <button className="bg-surface-container-high text-[10px] font-bold py-1.5 text-white rounded-lg hover:bg-surface-container-highest transition-colors">25%</button>
                <button className="bg-surface-container-high text-[10px] font-bold py-1.5 text-white rounded-lg hover:bg-surface-container-highest transition-colors">50%</button>
                <button className="bg-surface-container-high text-[10px] font-bold py-1.5 text-white rounded-lg hover:bg-surface-container-highest transition-colors">75%</button>
                <button className="bg-surface-container-high text-[10px] font-bold py-1.5 text-white rounded-lg hover:bg-surface-container-highest transition-colors">POT</button>
                <button className="bg-surface-container-high text-[10px] font-bold py-1.5 text-white rounded-lg hover:bg-surface-container-highest transition-colors">ALL</button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 items-end pb-1 overflow-x-auto w-full md:w-auto p-1">
              <button onClick={() => handleAction('FOLD')} disabled={store.currentPlayerIndex !== 0} className="disabled:opacity-50 px-6 md:px-8 py-4 bg-surface-container-high text-on-surface font-headline font-bold rounded-2xl border border-outline-variant transition-all uppercase tracking-widest text-xs md:text-sm">
                Fold
              </button>
              <button onClick={() => handleAction('CHECK')} disabled={store.currentPlayerIndex !== 0 || currentHighestBet > hero.currentBet} className="disabled:opacity-50 px-6 md:px-8 py-4 bg-surface-container-high text-on-surface font-headline font-bold rounded-2xl border border-outline-variant transition-all uppercase tracking-widest text-xs md:text-sm">
                Check
              </button>
              <button onClick={() => handleAction('CALL')} disabled={store.currentPlayerIndex !== 0 || currentHighestBet <= hero.currentBet} className="disabled:opacity-50 px-6 md:px-8 py-4 bg-surface-container-high text-on-surface font-headline font-bold rounded-2xl border border-outline-variant transition-all uppercase tracking-widest text-xs md:text-sm">
                Call {Math.max(0, currentHighestBet - hero.currentBet)}
              </button>
              <button onClick={() => handleAction('RAISE')} disabled={store.currentPlayerIndex !== 0} className="disabled:opacity-50 px-8 md:px-10 py-4 bg-primary-container text-on-primary font-headline font-black rounded-2xl shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all uppercase tracking-widest text-xs md:text-sm">
                Raise
              </button>
            </div>
            {/* Quick Temp Bot auto-mover */}
            <div className="fixed bottom-4 left-4 bg-surface p-2 rounded border border-outline-variant z-50 shadow-2xl flex flex-col gap-2">
               <span className="text-[10px] text-on-surface-variant font-bold uppercase p-1">Debug Controls</span>
               <button 
                 onClick={() => {
                     // Auto bot act (Call or Check)
                     const amt = Math.max(0, currentHighestBet - store.players[store.currentPlayerIndex].currentBet)
                     store.playerAction(amt > 0 ? 'CALL' : 'CHECK')
                 }} 
                 disabled={store.currentPlayerIndex === 0 || store.winners.length > 0} 
                 className="bg-primary-fixed/20 text-primary-fixed hover:bg-primary-fixed/30 text-xs px-2 py-1 rounded font-mono disabled:opacity-50"
               >
                 Auto Act Bot
               </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

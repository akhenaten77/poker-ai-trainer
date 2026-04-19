"use client";

import React, { useEffect, useState, useRef } from "react";
import { useGameStore } from "../store/gameStore";
import { PlayingCard } from "../components/PlayingCard";
import { getBotDecision, getCoachFeedback } from "./actions/gemini";

function PlayerNode({ p, idx, store }: { p: any, idx: number, store: any }) {
  const [lastBet, setLastBet] = useState(p.currentBet);
  const [floatKey, setFloatKey] = useState(0);
  const [floatAction, setFloatAction] = useState("");

  useEffect(() => {
     if (p.currentBet > lastBet) {
        setFloatAction(`+$${p.currentBet - lastBet}`); // Just showing amount added this specific step is best, but simplistically:
        setFloatKey(k => k + 1);
        setLastBet(p.currentBet);
     } else if (p.currentBet === 0 && lastBet > 0) {
        setLastBet(0);
     }
  }, [p.currentBet, lastBet]);

  useEffect(() => {
    if (p.hasFolded) {
       setFloatAction("FOLD");
       setFloatKey(k => k + 1);
    }
  }, [p.hasFolded]);

  const isHero = p.id === "hero";
  const numPlayers = store.players.length;
  
  const isDealer = store.dealerIndex === idx;
  const isSB = (store.dealerIndex + 1) % numPlayers === idx;
  const isBB = (store.dealerIndex + 2) % numPlayers === idx;
  
  const roleTags = [
    isDealer ? 'D' : null,
    isSB ? 'SB' : null,
    isBB ? 'BB' : null
  ].filter(Boolean).join('/');

  const roleDisplay = roleTags ? `(${roleTags})` : '';
  
  // Calculate angle for circular distribution
  // Hero (idx 0) is at the bottom (90 degrees or PI/2)
  // We distribute others clockwise starting from Hero
  const angle = (idx / numPlayers) * 2 * Math.PI + (Math.PI / 2);
  
  // Radius of the circle (as percentage of container)
  const radiusX = 40; // 40% horizontal radius
  const radiusY = 38; // 38% vertical radius
  
  const left = 50 + radiusX * Math.cos(angle);
  const top = 50 + radiusY * Math.sin(angle);

  const isActive = store.currentPlayerIndex === idx && store.winners.length === 0;

  return (
    <div 
      className="absolute flex flex-col items-center pointer-events-auto -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${left}%`, top: `${top}%` }}
    >
       <div className="relative">
         {floatKey > 0 && (
           <div key={floatKey} className="absolute -top-8 left-1/2 -translate-x-1/2 text-[#39FF14] font-black text-lg animate-float-up pointer-events-none drop-shadow-md z-50 whitespace-nowrap">
             {floatAction}
           </div>
         )}
         <div className={`p-3 rounded-xl border ${isActive ? 'bg-[#39FF14]/20 border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.5)]' : 'bg-black/80 border-white/10'} backdrop-blur-md mb-2 flex flex-col items-center min-w-[120px] transition-all`}>
           <div className="text-xs font-bold text-gray-400">{p.name} <span className="text-[#39FF14]">{roleDisplay}</span></div>
           <div className="text-lg font-black text-white transition-all duration-700">${p.stack.toFixed(2)}</div>
           
           {p.currentBet > 0 && (
              <div className="mt-1 bg-white/10 px-2 py-0.5 rounded text-xs font-bold text-[#39FF14] transition-all duration-700">
                Bet: ${p.currentBet}
              </div>
           )}

           {p.hasFolded && <div className="mt-1 text-red-500 font-bold text-xs">FOLDED</div>}
           {p.isAllIn && <div className="mt-1 text-yellow-500 font-bold text-xs uppercase text-center bg-yellow-500/10 px-2 rounded">All In</div>}
         </div>
       </div>
       
       {!p.hasFolded && (
         <div className="flex gap-1 relative z-0">
           <PlayingCard card={p.cards[0]} hidden={p.isBot && store.winners.length === 0} />
           <PlayingCard card={p.cards[1]} hidden={p.isBot && store.winners.length === 0} />
         </div>
       )}
    </div>
  );
}

export default function Home() {
  const store = useGameStore();
  const [mounted, setMounted] = React.useState(false);
  const [raiseAmount, setRaiseAmount] = useState<number>(0);
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState({
    name: 'HERO',
    botsCount: 3,
    startingStack: 2000,
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard'
  });

  // Handle hydration: only render client-specific state after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track the last turn we triggered an AI move for to prevent loops/race conditions
  const lastActedTurn = useRef<string>("");

  // Trigger AI action if it's a bot's turn
  useEffect(() => {
    const isHeroTurn = store.players[store.currentPlayerIndex]?.id === "hero";
    const currentPlayer = store.players[store.currentPlayerIndex];
    // Include currentHighestBet in the turnKey so that if the hero raises (bet changes), 
    // the bot will accurately re-trigger its action instead of thinking it has already acted this round.
    const turnKey = `${store.currentRound}-${store.currentPlayerIndex}-${store.communityCards.length}-${store.currentHighestBet}`;

    if (
      store.players.length === 0 || 
      store.winners.length > 0 || 
      isHeroTurn || 
      !currentPlayer ||
      lastActedTurn.current === turnKey
    ) return;

    let isCancelled = false;
    const fetchBotAction = async () => {
      try {
        // Mark this turn as "in progress" immediately
        lastActedTurn.current = turnKey;
        
        // Log that the bot is thinking
        store.addLog(`${currentPlayer.name} is thinking...`);
        
        const aiDecision = await getBotDecision(store as any, store.currentPlayerIndex);
        
        if (!isCancelled) {
          store.playerAction(aiDecision.action, aiDecision.amount);
        }
      } catch (error) {
        console.error("Bot action failed:", error);
        if (!isCancelled) {
          // Robust fallback to prevent stalling
          const toCall = store.currentHighestBet - currentPlayer.currentBet;
          store.playerAction(toCall > 0 ? "FOLD" : "CHECK");
        }
      }
    };

    const timer = setTimeout(fetchBotAction, 2000); 
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [
    store.currentPlayerIndex, 
    store.currentRound, 
    store.winners.length, 
    store.players.length, 
    store.communityCards.length,
    store.currentHighestBet, // Track to ensure we respond to raises
  ]);

  // Handle Hero Action Wrapper to fetch coaching feedback
  const handleHeroAction = async (action: 'FOLD' | 'CHECK' | 'CALL' | 'RAISE', amount?: number) => {
    const stateSnapshot = store as any;
    store.playerAction(action, amount); // Fire immediately for snappy UI
    
    // Now trigger async AI Coach feedback
    const feedback = await getCoachFeedback(stateSnapshot, action, amount);
    store.addAdvice(feedback, 'ADVICE');
  };

  // Sync raise input with current highest bet + min raise whenever it becomes hero's turn
  useEffect(() => {
    const isHeroTurn = store.players[store.currentPlayerIndex]?.id === "hero";
    if (isHeroTurn) {
      setRaiseAmount(store.currentHighestBet + store.minRaise);
    }
  }, [store.currentPlayerIndex, store.currentHighestBet, store.minRaise, store.players]);

  // Ref hook to auto-scroll history
  const historyEndRef = React.useRef<HTMLDivElement>(null);
  const [adviceEndRef, setAdviceEndRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    adviceEndRef?.scrollIntoView({ behavior: 'smooth' });
  }, [store.coachAdvices, adviceEndRef]);

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [store.handHistory]);

  if (!mounted) return <div className="min-h-screen bg-[#131313]" />;

  if (store.players.length === 0 && !showSetup) {
    return (
      <div className="bg-[#0A0A0A] text-[#E5E2E1] min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#39FF14]/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#39FF14]/5 rounded-full blur-[120px] animate-pulse delay-1000"></div>

        <div className="z-10 text-center space-y-8 max-w-2xl">
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#39FF14]/20 bg-[#39FF14]/5 text-[#39FF14] text-xs font-black tracking-[0.3em] uppercase mb-4 animate-bounce">
            Advanced Agentic AI
          </div>
          <h1 className="text-7xl md:text-8xl font-black text-white tracking-tighter leading-none mb-6 font-headline">
            POKER <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#39FF14] to-[#1DA10F]">TRAINER</span>
          </h1>
          <p className="text-xl text-gray-500 mb-12 max-w-lg mx-auto text-center font-medium leading-relaxed">
            Sharpen your GTO strategy against elite Gemini-powered agents in a high-stakes digital environment.
          </p>
          <button
            onClick={() => setShowSetup(true)} 
            className="group relative inline-flex items-center gap-4 px-12 py-5 bg-[#39FF14] text-black font-black rounded-2xl text-xl shadow-[0_20px_50px_rgba(57,255,20,0.3)] hover:scale-105 active:scale-95 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 slant-glow"></div>
            START SESSION
            <span className="material-symbols-outlined text-black font-bold group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
      </div>
    );
  }

  if (showSetup) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        
        <div className="w-full max-w-xl bg-[#161616] border border-white/10 rounded-[40px] p-10 shadow-2xl relative z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/10 blur-[60px]"></div>
          
          <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Configure Table</h2>
          <p className="text-gray-500 mb-10 text-sm font-medium">Set your preferences for this training session.</p>

          <div className="space-y-8">
            {/* NAME */}
            <div className="space-y-3">
              <label className="text-xs font-black text-[#39FF14] uppercase tracking-widest pl-1">Player Identity</label>
              <input 
                type="text" 
                value={setupData.name}
                onChange={(e) => setSetupData({...setupData, name: e.target.value.toUpperCase()})}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#39FF14]/50 transition-colors"
                placeholder="YOUR NAME"
              />
            </div>

            {/* BOT COUNT */}
            <div className="space-y-3">
              <label className="text-xs font-black text-[#39FF14] uppercase tracking-widest pl-1">Opponents ({setupData.botsCount})</label>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => setSetupData({...setupData, botsCount: num})}
                    className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all border ${
                      setupData.botsCount === num 
                        ? 'bg-[#39FF14] border-[#39FF14] text-black shadow-[0_0_20px_rgba(57,255,20,0.2)]' 
                        : 'bg-black/40 border-white/5 text-gray-500 hover:border-white/10'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* DIFFICULTY */}
            <div className="space-y-3">
              <label className="text-xs font-black text-[#39FF14] uppercase tracking-widest pl-1">AI Intelligence</label>
              <div className="grid grid-cols-3 gap-3">
                {['Easy', 'Medium', 'Hard'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSetupData({...setupData, difficulty: diff as any})}
                    className={`py-4 rounded-2xl font-black text-xs transition-all border ${
                      setupData.difficulty === diff 
                        ? 'bg-[#39FF14] border-[#39FF14] text-black' 
                        : 'bg-black/40 border-white/5 text-gray-500 hover:border-white/10'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-6">
              <button 
                onClick={() => {
                  store.initializeGame(setupData.name, setupData.botsCount, setupData.startingStack, setupData.difficulty);
                  setShowSetup(false);
                }}
                className="w-full py-5 bg-gradient-to-r from-[#39FF14] to-[#1DA10F] text-black font-black text-lg rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(57,255,20,0.2)]"
              >
                JOIN TABLE
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hero = store.players.find((p) => p.id === "hero");
  const isHeroTurn = store.players[store.currentPlayerIndex]?.id === "hero" && store.winners.length === 0;

  const toCall = hero ? store.currentHighestBet - hero.currentBet : 0;

  return (
    <div className="bg-[#131313] text-white min-h-screen flex flex-col lg:flex-row font-body">
      {/* Left Column: Poker Table & Action Controls */}
      <div className="flex-1 flex flex-col relative h-screen">
        {/* Header */}
        <header className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0C0C0C]">
          <div className="text-xl font-black text-[#39FF14] tracking-tighter font-headline flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse"></span>
            OBSIDIAN AI
          </div>
          <div className="flex gap-4 items-center">
               <div className="bg-white/10 px-4 py-1.5 rounded text-sm text-gray-300 font-bold uppercase tracking-widest">
                Round: {store.currentRound}
              </div>
              <button
                onClick={() => store.startHand()}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-sm font-bold transition-colors"
                disabled={store.winners.length === 0 && store.players.length > 0}
              >
                Next Hand
              </button>
              <button
                onClick={() => store.resetGame()}
                className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-sm font-bold transition-colors"
              >
                Reset
              </button>
          </div>
        </header>

        {/* Table Area */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#132514] via-[#0a0a0a] to-[#050505]">
          
          {/* Pot Info - Moved to corner as a professional HUD */}
          <div className="absolute top-6 left-6 text-left z-10 bg-black/40 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-md shadow-xl">
            <div className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">TABLE POT</div>
            <div className="text-2xl font-black text-[#39FF14] drop-shadow-[0_0_10px_rgba(57,255,20,0.3)]">${store.pot.toFixed(2)}</div>
          </div>

          {/* Community Cards */}
          <div className="flex gap-2 min-h-[80px] z-10">
            {store.communityCards.map((card, i) => (
              <PlayingCard key={i} card={card} />
            ))}
            {/* Placeholders for unfilled community cards based on street */}
            {store.communityCards.length < 5 && Array.from({ length: 5 - store.communityCards.length }).map((_, i) => (
              <div key={`empty-${i}`} className="w-14 h-20 border-2 border-white/10 border-dashed rounded-md opacity-30"></div>
            ))}
          </div>

          {/* Players Distributed in a grid/circle approximation */}
          <div className="absolute inset-2 z-0 pointer-events-none border-[1px] border-[#39FF14]/5 rounded-[4rem]">
            {store.players.map((p, idx) => (
                <PlayerNode 
                  key={p.id} 
                  p={p} 
                  idx={idx} 
                  store={store as any} 
                />
            ))}
          </div>

          {/* Showdown Result Overlay */}
          {store.winners.length > 0 && store.showdownResults && (
            <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center backdrop-blur-md p-6 overflow-y-auto">
                <div className="text-4xl font-black text-[#39FF14] mb-8 mt-auto">
                  Showdown complete!
                </div>
                
                <div className="flex flex-wrap gap-6 items-center justify-center max-w-5xl mb-8">
                  {store.showdownResults.map((res) => (
                     <div key={res.id} className={`flex flex-col items-center bg-[#1A1A1A] rounded-xl p-4 border-2 ${res.isWinner ? 'border-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.3)]' : 'border-white/10 opacity-70'}`}>
                        <div className="text-gray-400 font-bold mb-2 text-sm">{res.name} {res.isWinner && '(WINNER)'}</div>
                        <div className="flex gap-2 mb-3">
                           <PlayingCard card={res.cards[0]} hidden={false} />
                           <PlayingCard card={res.cards[1]} hidden={false} />
                        </div>
                        <div className="text-white font-bold text-lg">{res.handName}</div>
                        <div className="text-gray-400 text-xs text-center max-w-[120px]">{res.handDescr}</div>
                        {res.isWinner && <div className="mt-2 text-[#39FF14] font-black">+${res.winAmount.toFixed(2)}</div>}
                     </div>
                  ))}
                </div>

                <button
                  onClick={() => store.startHand()}
                  className="mb-auto px-8 py-3 bg-[#39FF14] text-black font-bold rounded-lg hover:scale-105 transition-transform"
                >
                  Play Next Hand
                </button>
            </div>
          )}
        </div>

        {/* Hero Control Panel */}
        <div className="h-32 bg-[#161616] border-t border-white/10 flex items-center justify-center p-4 gap-4">
            {!isHeroTurn && store.winners.length === 0 && (
                <div className="text-gray-400 font-bold animate-pulse">Waiting for opponents...</div>
            )}
            
            {isHeroTurn && hero && (
               <>
                 <button 
                   onClick={() => handleHeroAction("FOLD")}
                   className="h-14 px-8 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-lg font-bold transition-colors"
                 >
                   Fold
                 </button>
                 
                 <button 
                   onClick={() => handleHeroAction(toCall > 0 ? "CALL" : "CHECK")}
                   className="h-14 px-8 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-lg font-bold transition-colors"
                 >
                   {toCall > 0 ? `Call $${toCall}` : 'Check'}
                 </button>

                 <div className="flex h-14 bg-black border border-white/20 rounded-lg overflow-hidden ml-4">
                    <input 
                      type="number"
                      value={raiseAmount || ''}
                      onChange={(e) => setRaiseAmount(Number(e.target.value))}
                      className="w-24 bg-transparent text-white px-4 outline-none font-bold text-center"
                      min={store.currentHighestBet + store.minRaise}
                    />
                    <button 
                      onClick={() => handleHeroAction("RAISE", raiseAmount)}
                      className="px-6 bg-[#39FF14] hover:bg-[#39FF14]/90 text-black font-bold border-l border-white/20 transition-colors"
                    >
                       Raise To
                    </button>
                 </div>
               </>
            )}
        </div>
      </div>

      {/* Right Column: Coaching & Live Log */}
      <aside className="w-full lg:w-96 flex flex-col bg-[#111111] border-l border-white/10 h-screen overflow-hidden">
        
        {/* Strategic Analysis - TOP PANEL */}
        <div className="h-[45%] flex flex-col p-6 border-b border-white/5 bg-[#161616]">
          <div className="flex items-center gap-2 mb-4">
             <span className="material-symbols-outlined text-[#39FF14] animate-pulse text-sm">psychology</span>
             <h2 className="font-headline font-black text-[10px] tracking-[0.2em] text-[#39FF14] uppercase">Strategic Analysis</h2>
          </div>
          <div className="flex-1 bg-black/40 rounded-2xl border border-[#39FF14]/10 p-4 overflow-y-auto custom-scrollbar space-y-4">
             {store.coachAdvices.length === 0 ? (
               <div className="h-full flex items-center justify-center text-gray-600 italic text-xs">
                 Waiting for the hand to progress...
               </div>
             ) : (
               store.coachAdvices.map((advice, i) => (
                 <div key={i} className={`text-sm leading-relaxed ${
                   advice.type === 'STREET' ? 'text-center py-2 border-y border-white/5 font-black text-[#39FF14]/40 uppercase tracking-widest text-[10px]' :
                   advice.type === 'SYSTEM' ? 'text-gray-500 italic text-[11px]' :
                   'text-[#E5E2E1] font-medium italic'
                 }`}>
                   {advice.text}
                 </div>
               ))
             )}
             <div ref={(el) => setAdviceEndRef(el)} />
          </div>
        </div>

        {/* Live Action Log - BOTTOM PANEL */}
        <div className="h-[60%] flex flex-col p-6 overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
             <span className="material-symbols-outlined text-gray-500 text-sm">history_edu</span>
             <h2 className="font-headline font-black text-[10px] tracking-[0.1em] text-gray-400 uppercase">Live Action Log</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-black/20 p-4 rounded-xl space-y-3 custom-scrollbar">
             {store.handHistory.map((log, idx) => {
               const isHero = log.includes("HERO");
               const isStreet = log.startsWith("---");
               const isThinking = log.includes("thinking");
               
               return (
                 <div 
                   key={idx} 
                   className={`text-xs tracking-tight ${
                     isHero ? 'text-[#39FF14] font-bold' : 
                     isStreet ? 'text-gray-400 font-black text-center py-4 border-y border-white/5 bg-white/5 uppercase tracking-[0.2em] my-4' : 
                     isThinking ? 'text-gray-600 italic animate-pulse' :
                     'text-gray-500 font-medium'
                   }`}
                 >
                   <span className="opacity-20 mr-2 tabular-nums">[{new Date().toLocaleTimeString([], { hour12: false, minute: "2-digit", second: "2-digit" })}]</span>
                   {log}
                 </div>
               );
             })}
             <div ref={historyEndRef} />
          </div>
        </div>
      </aside>
    </div>
  );
}

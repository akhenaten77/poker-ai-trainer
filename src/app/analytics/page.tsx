import Image from "next/image";

export default function AnalyticsPage() {
  const cards = [
    "AA", "AKs", "AQs", "AJs", "ATs", "A9s", "A8s", "A7s", "A6s", "A5s", "A4s", "A3s", "A2s",
    "AKo", "KK", "KQs", "KJs", "KTs", "K9s", "K8s", "K7s", "K6s", "K5s", "K4s", "K3s", "K2s",
    "AQo", "KQo", "QQ", "QJs", "QTs", "Q9s", "Q8s", "Q7s", "Q6s", "Q5s", "Q4s", "Q3s", "Q2s",
    "AJo", "KJo", "QJo", "JJ", "JTs", "J9s", "J8s", "J7s", "J6s", "J5s", "J4s", "J3s", "J2s",
    "ATo", "KTo", "QTo", "JTo", "TT", "T9s", "T8s", "T7s", "T6s", "T5s", "T4s", "T3s", "T2s",
    "A9o", "K9o", "Q9o", "J9o", "T9o", "99", "98s", "97s", "96s", "95s", "94s", "93s", "92s",
    "A8o", "K8o", "Q8o", "J8o", "T8o", "98o", "88", "87s", "86s", "85s", "84s", "83s", "82s",
    "A7o", "K7o", "Q7o", "J7o", "T7o", "97o", "87o", "77", "76s", "75s", "74s", "73s", "72s",
    "A6o", "K6o", "Q6o", "J6o", "T6o", "96o", "86o", "76o", "66", "65s", "64s", "63s", "62s",
    "A5o", "K5o", "Q5o", "J5o", "T5o", "95o", "85o", "75o", "65o", "55", "54s", "53s", "52s",
    "A4o", "K4o", "Q4o", "J4o", "T4o", "94o", "84o", "74o", "64o", "54o", "44", "43s", "42s",
    "A3o", "K3o", "Q3o", "J3o", "T3o", "93o", "83o", "73o", "63o", "53o", "43o", "33", "32s",
    "A2o", "K2o", "Q2o", "J2o", "T2o", "92o", "82o", "72o", "62o", "52o", "42o", "32o", "22",
  ];

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary min-h-screen flex">
      {/* Side Navigation */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#1C1B1B] border-r border-[#2A2A2A] z-40 shadow-[20px_0_40px_rgba(0,0,0,0.4)] hidden lg:flex flex-col">
        <div className="p-6">
          <h1 className="font-headline text-[#39FF14] font-bold text-2xl tracking-tighter">
            OBSIDIAN
          </h1>
          <div className="mt-8 flex items-center gap-3 p-3 bg-surface-container-high rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <div>
              <p className="text-on-surface font-bold text-sm">AI Coach</p>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-wider">
                Elite Intellect
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <a className="flex items-center gap-3 text-[#BACCB0] px-4 py-3 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all rounded-lg" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm font-medium">Dashboard</span>
          </a>
          <a className="flex items-center gap-3 text-[#BACCB0] px-4 py-3 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all rounded-lg" href="#">
            <span className="material-symbols-outlined">psychology</span>
            <span className="text-sm font-medium">Training</span>
          </a>
          <a className="flex items-center gap-3 text-[#BACCB0] px-4 py-3 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all rounded-lg" href="#">
            <span className="material-symbols-outlined">history</span>
            <span className="text-sm font-medium">Hand History</span>
          </a>
          <a className="flex items-center gap-3 text-[#BACCB0] px-4 py-3 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all rounded-lg" href="#">
            <span className="material-symbols-outlined">grid_view</span>
            <span className="text-sm font-medium">Range Lab</span>
          </a>
          <a className="flex items-center gap-3 bg-[#2A2A2A] text-[#39FF14] rounded-lg px-4 py-3 border-l-4 border-[#39FF14]" href="#">
            <span className="material-symbols-outlined">analytics</span>
            <span className="text-sm font-medium">AI Insights</span>
          </a>
        </nav>
        <div className="p-6 mt-auto">
          <button className="w-full bg-primary-container text-on-primary font-bold py-3 rounded-xl hover:opacity-90 transition-all text-xs tracking-widest flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">bolt</span>
            PRO UPGRADE
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 bg-surface min-h-screen pb-20 lg:pb-0">
        {/* Top App Bar */}
        <header className="sticky top-0 z-50 flex justify-between items-center px-4 lg:px-8 py-4 w-full bg-[#131313]/90 backdrop-blur border-b border-outline-variant/10">
          <div className="flex items-center gap-8">
            <span className="text-xl font-black text-[#39FF14] tracking-tighter font-headline lg:hidden block">
              OBSIDIAN
            </span>
            <nav className="hidden md:flex items-center gap-6">
              <a className="text-[#BACCB0] hover:text-[#E5E2E1] transition-colors duration-300 font-headline font-bold" href="#">Live Practice</a>
              <a className="text-[#BACCB0] hover:text-[#E5E2E1] transition-colors duration-300 font-headline font-bold" href="#">Hand Review</a>
              <a className="text-[#39FF14] border-b-2 border-[#39FF14] pb-1 font-headline font-bold" href="#">Analytics</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-[#BACCB0] hover:bg-[#2A2A2A] transition-colors duration-300 rounded-full hidden md:block">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </button>
            <button className="p-2 text-[#BACCB0] hover:bg-[#2A2A2A] transition-colors duration-300 rounded-full hidden md:block">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant shrink-0">
              <img
                alt="User"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCl_9mTPsi0zLpI0Z6ALSFKw4vdU-xrks4-KfOsvzv1aRu1vLQV2WZZTN6XsqczGVReeJNBZ6aKPkF9AljS6EYHjg16G5BMMEAL9gK1Q74wE_FFBmEJEM0I_FFiYUzBHO5MjDopaFD2IYRVUR2MgaREKLVwaHk7vBSL5qhBipR3WofdFr5ne8MLBS0GPVXmObT078CQCBNkBIpX_ZnHamAXwWm5NE7bbI03uyRBC-JqxhLC5zHbG6L3IVsMlT_M3bafnscnhebBZSY"
              />
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-8">
          {/* Header & KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
            <div className="sm:col-span-2 xl:col-span-1">
              <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
                Analytics
              </h2>
              <p className="text-on-surface-variant text-sm mt-1">
                Training Performance Overview
              </p>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl border-l-[6px] border-primary-container shadow-lg flex flex-col justify-between">
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">
                Total Hands
              </span>
              <div className="flex justify-between items-end">
                <span className="text-3xl font-headline font-black text-on-surface">
                  142k
                </span>
                <span className="text-primary-container text-sm font-bold flex items-center">
                  <span className="material-symbols-outlined text-[10px] mr-1">trending_up</span> +12%
                </span>
              </div>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl border-l-[6px] border-primary-container shadow-lg flex flex-col justify-between">
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">
                Win Rate (bb/100)
              </span>
              <div className="flex justify-between items-end">
                <span className="text-3xl font-headline font-black text-primary-container drop-shadow-[0_0_8px_rgba(57,255,20,0.3)]">
                  6.42
                </span>
                <span className="text-primary-container text-sm font-bold">Stable</span>
              </div>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl border-l-[6px] border-primary-container shadow-lg flex flex-col justify-between">
              <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">
                EV Gained
              </span>
              <div className="flex justify-between items-end">
                <span className="text-3xl font-headline font-black text-on-surface">
                  $12.4k
                </span>
                <span className="text-primary-container text-sm font-bold flex items-center">
                  <span className="material-symbols-outlined text-[10px] mr-1">trending_up</span> +$840
                </span>
              </div>
            </div>
          </div>

          {/* Bento Grid Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Range Heatmap */}
            <div className="col-span-1 xl:col-span-8 bg-surface-container-low p-6 md:p-8 rounded-2xl relative overflow-hidden border border-outline-variant/10 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4">
                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface">
                    Starting Hand Heatmap
                  </h3>
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mt-1">
                    Profitability by hole cards
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-lg text-xs font-bold border border-outline-variant/30 transition-colors">
                    RFI
                  </button>
                  <button className="px-4 py-2 bg-primary-container hover:brightness-110 text-on-primary rounded-lg text-xs font-bold shadow-[0_0_15px_rgba(57,255,20,0.3)] transition-all">
                    PROFIT
                  </button>
                </div>
              </div>
              <div
                className="w-full max-w-2xl mx-auto overflow-hidden bg-black/50 p-1 md:p-2 rounded-xl"
                style={{
                  gridTemplateColumns: "repeat(13, 1fr)",
                  gap: "2px",
                  display: "grid",
                }}
              >
                {cards.map((card, index) => {
                  // Simplified deterministic mock distribution for aesthetic display
                  const row = Math.floor(index / 13);
                  const col = index % 13;
                  const distance = Math.sqrt(row * row + col * col);
                  const isProfitable = distance < 8 || (row === col && distance < 12);
                  const intensity = Math.max(10, 100 - distance * 10);

                  return (
                    <div
                      key={index}
                      className={`aspect-square rounded-sm flex items-center justify-center text-[7px] md:text-[9px] font-bold ${
                        isProfitable
                          ? "bg-primary-container text-on-primary"
                          : "bg-surface-container-high text-on-surface-variant/50"
                      } cursor-pointer hover:scale-110 transition-transform`}
                      style={{ opacity: isProfitable ? intensity / 100 : 1 }}
                      title={`${card} - EV: ${isProfitable ? "+" : "-"}${Math.random().toFixed(2)}`}
                    >
                      {card}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Leak Analysis and Warnings */}
            <div className="col-span-1 xl:col-span-4 space-y-6">
              {/* Leak Analysis */}
              <div className="bg-surface-container-low p-6 md:p-8 rounded-2xl border border-outline-variant/10 shadow-xl">
                <h3 className="font-headline text-lg font-bold mb-6">Leak Analysis</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-surface-container-high rounded-xl border-l-4 border-error">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold text-error">
                        Fold to 3-bet
                      </span>
                      <span className="text-xl font-headline font-black text-error">
                        60%
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden mt-2">
                      <div className="bg-error h-full rounded-full w-[60%] shadow-[0_0_8px_rgba(255,180,171,0.5)]"></div>
                    </div>
                    <p className="text-[10px] text-error mt-2 font-bold uppercase tracking-tighter">
                      Status: High - Exploitable
                    </p>
                  </div>
                  <div className="p-4 bg-surface-container-high rounded-xl border-l-4 border-primary-container">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold text-primary-container">
                        C-bet Freq
                      </span>
                      <span className="text-xl font-headline font-black text-primary-container">
                        45%
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden mt-2">
                      <div className="bg-primary-container h-full rounded-full w-[45%] shadow-[0_0_8px_rgba(57,255,20,0.5)]"></div>
                    </div>
                    <p className="text-[10px] text-primary-container mt-2 font-bold uppercase tracking-tighter">
                      Status: Optimal - GTO Baseline
                    </p>
                  </div>
                </div>
              </div>

              {/* Tactical Indicators */}
              <div className="bg-surface-container-low p-6 md:p-8 rounded-2xl border border-outline-variant/10 shadow-xl">
                <h3 className="font-headline text-lg font-bold mb-4">
                  Tactical Indicators
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 lg:p-4 bg-surface-container-lowest border border-primary-container/20 rounded-xl">
                    <span
                      className="material-symbols-outlined text-primary-container"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      bolt
                    </span>
                    <span className="text-sm font-bold text-on-surface">
                      Overbet: <span className="text-primary-container">ACTIVE</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 lg:p-4 bg-error-container/10 border border-error/20 rounded-xl">
                    <span
                      className="material-symbols-outlined text-error"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      warning
                    </span>
                    <span className="text-sm font-bold text-error">
                      Weak Preflop Play
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 lg:p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl">
                    <span className="material-symbols-outlined text-on-surface-variant">
                      monitoring
                    </span>
                    <span className="text-xs font-medium text-on-surface-variant italic">
                      Bluff frequency: 22% (Normal)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* River Mistakes Chart */}
            <div className="col-span-1 xl:col-span-7 bg-surface-container-low p-6 lg:p-8 rounded-2xl border border-outline-variant/10 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <h3 className="font-headline text-xl font-bold">
                  River Mistakes Analysis
                </h3>
                <div className="bg-surface-container-high px-3 py-1 rounded-lg text-xs font-medium text-on-surface-variant">
                  Last 30 Days
                </div>
              </div>
              
              <div className="h-[200px] sm:h-64 flex items-end gap-2 lg:gap-4 px-2 lg:px-4 pb-8 border-b border-l border-outline-variant/20 relative ml-8 lg:ml-12 mt-4">
                {/* Y-Axis Labels */}
                <div className="absolute -left-10 lg:-left-12 top-0 h-full flex flex-col justify-between text-[8px] lg:text-[10px] text-on-surface-variant font-bold pb-8">
                  <span>$5k</span>
                  <span>$4k</span>
                  <span>$3k</span>
                  <span>$2k</span>
                  <span>$1k</span>
                  <span>$0</span>
                </div>

                {/* Bars */}
                {/* Overcall */}
                <div className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="w-full bg-error/20 rounded-t-lg relative group-hover:bg-error/30 transition-all border-t border-error/40 h-[40%]">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-highest px-2 py-1 rounded text-[10px] font-bold text-error whitespace-nowrap z-10 shadow-lg">
                      $2,140
                    </div>
                  </div>
                  <span className="text-[8px] lg:text-[10px] text-on-surface-variant font-bold text-center absolute -bottom-6 w-16">
                    Overcall
                  </span>
                </div>

                {/* Missed Value */}
                <div className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="w-full bg-error/60 rounded-t-lg relative group-hover:bg-error/70 transition-all border-t border-error/80 h-[85%]">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-highest px-2 py-1 rounded text-[10px] font-bold text-error whitespace-nowrap z-10 shadow-lg">
                      $4,820
                    </div>
                  </div>
                  <span className="text-[8px] lg:text-[10px] text-on-surface-variant font-bold text-center absolute -bottom-6 w-16">
                    Miss Val
                  </span>
                </div>

                {/* Bad Bluff */}
                <div className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="w-full bg-error/40 rounded-t-lg relative group-hover:bg-error/50 transition-all border-t border-error/60 h-[55%]">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-highest px-2 py-1 rounded text-[10px] font-bold text-error whitespace-nowrap z-10 shadow-lg">
                      $2,980
                    </div>
                  </div>
                  <span className="text-[8px] lg:text-[10px] text-on-surface-variant font-bold text-center absolute -bottom-6 w-16">
                    Bad Bluff
                  </span>
                </div>

                {/* Fold to Bluff */}
                <div className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="w-full bg-error/10 rounded-t-lg relative group-hover:bg-error/20 transition-all border-t border-error/30 h-[15%]">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-highest px-2 py-1 rounded text-[10px] font-bold text-error whitespace-nowrap z-10 shadow-lg">
                      $420
                    </div>
                  </div>
                  <span className="text-[8px] lg:text-[10px] text-on-surface-variant font-bold text-center absolute -bottom-6 w-16">
                    Fold Bluff
                  </span>
                </div>

                {/* Sizing Error */}
                <div className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="w-full bg-error/30 rounded-t-lg relative group-hover:bg-error/40 transition-all border-t border-error/50 h-[30%]">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-highest px-2 py-1 rounded text-[10px] font-bold text-error whitespace-nowrap z-10 shadow-lg">
                      $1,100
                    </div>
                  </div>
                  <span className="text-[8px] lg:text-[10px] text-on-surface-variant font-bold text-center absolute -bottom-6 w-16">
                    Sizing
                  </span>
                </div>
              </div>
            </div>

            {/* Session History */}
            <div className="col-span-1 xl:col-span-5 bg-surface-container-low p-6 lg:p-8 rounded-2xl relative overflow-hidden shadow-xl">
              <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at top right, rgba(57, 255, 20, 0.1) 0%, transparent 60%)",
                }}
              ></div>
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline text-xl font-bold">
                    Recent Evolution
                  </h3>
                  <button className="text-primary-container text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 hover:text-primary-fixed transition-colors">
                    Full Log{" "}
                    <span className="material-symbols-outlined text-sm">
                      arrow_forward
                    </span>
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-surface-container-high/60 backdrop-blur-md rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer border border-transparent hover:border-outline-variant/20">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-10 bg-primary-container rounded-full shadow-[0_0_8px_rgba(57,255,20,0.5)]"></div>
                      <div>
                        <p className="font-bold text-sm">3-Bet Defense</p>
                        <p className="text-xs text-on-surface-variant">
                          vs Button Open
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-primary-container font-headline font-bold text-sm">
                        +2.4 bb/100
                      </p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                        Last 5k
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-surface-container-high/60 backdrop-blur-md rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer border border-transparent hover:border-outline-variant/20">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-10 bg-error rounded-full shadow-[0_0_8px_rgba(255,180,171,0.5)]"></div>
                      <div>
                        <p className="font-bold text-sm">River Leads</p>
                        <p className="text-xs text-on-surface-variant">
                          Over-leading dry
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-error font-headline font-bold text-sm">
                        -1.1 bb/100
                      </p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                        Session
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-surface-container-high/60 backdrop-blur-md rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer border border-transparent hover:border-outline-variant/20">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-10 bg-primary-container rounded-full shadow-[0_0_8px_rgba(57,255,20,0.5)]"></div>
                      <div>
                        <p className="font-bold text-sm">BB Defend</p>
                        <p className="text-xs text-on-surface-variant">
                          Optimal mix
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-primary-container font-headline font-bold text-sm">
                        +0.8 bb/100
                      </p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                        Trending
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-24 lg:bottom-8 right-6 lg:right-8 z-[100] md:z-50">
          <button className="bg-primary-container text-on-primary w-14 h-14 rounded-full shadow-[0_10px_30px_rgba(57,255,20,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
            <span
              className="material-symbols-outlined text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              bolt
            </span>
          </button>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-[#1C1B1B] flex justify-around items-center py-3 z-[90] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] border-t border-outline-variant/10">
        <button className="flex flex-col items-center gap-1 text-[#BACCB0]">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px]">Dashboard</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#BACCB0]">
          <span className="material-symbols-outlined">psychology</span>
          <span className="text-[10px]">Training</span>
        </button>
        <div className="bg-[#2A2A2A] text-[#BACCB0] p-3 rounded-full -translate-y-4 shadow-lg border border-outline-variant/30">
          <span className="material-symbols-outlined">history</span>
        </div>
        <button className="flex flex-col items-center gap-1 text-[#BACCB0]">
          <span className="material-symbols-outlined">grid_view</span>
          <span className="text-[10px]">Ranges</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#39FF14]">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
          <span className="text-[10px] font-bold">Analytics</span>
        </button>
      </nav>
    </div>
  );
}

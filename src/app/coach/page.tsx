import Image from "next/image";

export default function CoachPage() {
  // Generate a mock 13x13 grid for the range analyzer
  const gridCells = Array.from({ length: 169 }).map((_, i) => {
    // some pseudo-random distribution for the visual
    const isPrimary = i % 5 === 0 || i % 7 === 0 || i < 30;
    const opacity = isPrimary ? (Math.floor((i % 5) * 2 + 2) * 10) : 100;
    return (
      <div
        key={i}
        className={`rounded-sm aspect-square ${
          isPrimary ? "bg-primary-container" : "bg-surface-container-high"
        }`}
        style={{ opacity: isPrimary ? opacity / 100 : 1 }}
      />
    );
  });

  return (
    <div className="bg-surface-dim text-on-surface font-body selection:bg-primary-container selection:text-on-primary min-h-screen">
      {/* TopAppBar */}
      <header className="bg-[#1C1B1B] text-[#39FF14] font-headline font-bold tracking-tight shadow-none flex justify-between items-center px-6 py-4 w-full z-50 fixed border-b border-outline-variant/10">
        <div className="text-xl font-black text-[#39FF14] tracking-tighter">
          OBSIDIAN INTELLECT
        </div>
        <nav className="hidden md:flex gap-8 items-center h-full">
          <a
            className="text-[#BACCB0] hover:text-[#E5E2E1] transition-colors duration-300"
            href="#"
          >
            Live Practice
          </a>
          <a
            className="text-[#39FF14] border-b-2 border-[#39FF14] pb-1"
            href="#"
          >
            Hand Review
          </a>
          <a
            className="text-[#BACCB0] hover:text-[#E5E2E1] transition-colors duration-300"
            href="#"
          >
            Analytics
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <button className="hover:bg-[#2A2A2A] transition-colors duration-300 p-2 rounded-full">
            <span className="material-symbols-outlined">
              account_balance_wallet
            </span>
          </button>
          <button className="hover:bg-[#2A2A2A] transition-colors duration-300 p-2 rounded-full">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <img
            alt="User"
            className="w-8 h-8 rounded-full border border-outline-variant object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8teWWgglwRDz8kMLE8N-nRfFD2CfDbDAAXeEn1tBRPV9TbpHz6-MEWQniQe1vyF3a42sycPOd88Tmleyt7cE-NfCPKqmLs_bwLYDRzCnFQBvBX-vLUphjMSBYAgaCVXRJQ_bfcB42O4DqNyc14sdpPw4bJFUq84IXMlJ0S0r3jBFnTEBp6nYoX7eqZAMA5IwA-LRK-tZ78JMrpML9KkB501p2jyS9PiRATJatPeuP1Fcn1FLxcAQnHz-YdwaLCUIewmL_IQRlyfo"
          />
        </div>
      </header>

      {/* SideNavBar */}
      <aside className="bg-[#1C1B1B] text-[#39FF14] font-body font-medium text-sm fixed left-0 top-0 flex-col z-40 h-screen w-64 border-r border-[#2A2A2A] shadow-[20px_0_40px_rgba(0,0,0,0.4)] pt-20 hidden lg:flex">
        <div className="px-6 py-4 mb-6">
          <div className="font-headline text-[#39FF14] font-bold text-lg">
            AI Coach
          </div>
          <div className="text-on-surface-variant text-xs">
            Elite Intellect Active
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          <a
            className="flex items-center gap-3 text-[#BACCB0] px-4 py-3 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all"
            href="#"
          >
            <span className="material-symbols-outlined">dashboard</span>{" "}
            Dashboard
          </a>
          <a
            className="flex items-center gap-3 text-[#BACCB0] px-4 py-3 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all"
            href="#"
          >
            <span className="material-symbols-outlined">psychology</span>{" "}
            Training
          </a>
          <a
            className="flex items-center gap-3 bg-[#2A2A2A] text-[#39FF14] rounded-lg px-4 py-3 border-l-4 border-[#39FF14]"
            href="#"
          >
            <span className="material-symbols-outlined">history</span> Hand
            History
          </a>
          <a
            className="flex items-center gap-3 text-[#BACCB0] px-4 py-3 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all"
            href="#"
          >
            <span className="material-symbols-outlined">grid_view</span> Range
            Lab
          </a>
          <a
            className="flex items-center gap-3 text-[#BACCB0] px-4 py-3 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all"
            href="#"
          >
            <span className="material-symbols-outlined">analytics</span> AI
            Insights
          </a>
        </nav>
        <div className="px-6 py-6 border-t border-outline-variant/10">
          <button className="w-full bg-primary-container text-on-primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity">
            UPGRADE TO PRO
          </button>
          <div className="mt-4 space-y-1">
            <a
              className="flex items-center gap-3 text-[#BACCB0] px-2 py-2 hover:text-[#E5E2E1] transition-all text-xs"
              href="#"
            >
              <span className="material-symbols-outlined text-sm">help</span>{" "}
              Support
            </a>
            <a
              className="flex items-center gap-3 text-[#BACCB0] px-2 py-2 hover:text-[#E5E2E1] transition-all text-xs"
              href="#"
            >
              <span className="material-symbols-outlined text-sm">logout</span>{" "}
              Logout
            </a>
          </div>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="lg:ml-64 pt-24 p-8 min-h-screen felt-gradient overflow-x-hidden pb-24 lg:pb-8">
        {/* Hero Breadcrumb & Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <nav className="flex gap-2 text-on-surface-variant text-xs mb-2 items-center">
              <span>Session #8492</span>
              <span className="material-symbols-outlined text-[10px]">
                chevron_right
              </span>
              <span>Turn Analysis</span>
            </nav>
            <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-on-surface">
              AI Coach Analysis - Turn Decision
            </h1>
          </div>
          <div className="flex flex-wrap gap-2 bg-surface-container-low p-1 rounded-xl">
            <button className="px-4 py-2 text-xs font-medium rounded-lg text-on-surface-variant hover:text-on-surface">
              Preflop
            </button>
            <button className="px-4 py-2 text-xs font-medium rounded-lg text-on-surface-variant hover:text-on-surface">
              Flop
            </button>
            <button className="px-4 py-2 text-xs font-medium rounded-lg bg-surface-container-high text-primary-container ring-1 ring-primary-container/20">
              Turn
            </button>
            <button className="px-4 py-2 text-xs font-medium rounded-lg text-on-surface-variant hover:text-on-surface">
              River
            </button>
          </div>
        </div>

        {/* Analytical Bento Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Primary Verdict & Recommendation */}
          <div className="col-span-12 xl:col-span-4 space-y-6">
            {/* Verdict Card */}
            <div className="bg-surface-container-high/60 backdrop-blur-xl p-8 rounded-[2rem] border-l-8 border-error shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <span className="text-on-surface-variant font-headline uppercase tracking-widest text-xs">
                  Analysis Verdict
                </span>
                <span
                  className="material-symbols-outlined text-error"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  warning
                </span>
              </div>
              <div className="text-5xl md:text-6xl font-headline font-black text-error mb-2 italic">
                Inaccuracy
              </div>
              <p className="text-on-surface-variant leading-relaxed">
                Your aggressive line here deviates from GTO strategy. The board
                texture heavily favors the Defender&apos;s range on this turn
                card.
              </p>
            </div>

            {/* Recommendation Card */}
            <div className="bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/10">
              <span className="text-on-surface-variant font-headline uppercase tracking-widest text-xs block mb-4">
                Recommended Strategy
              </span>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary-container text-3xl">
                    lightbulb
                  </span>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-bold text-on-surface">
                    Optimal Move: Check
                  </div>
                  <div className="text-primary-container font-mono">
                    85% frequency
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Bet 33% Pot</span>
                  <span className="text-on-surface">12% frequency</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-primary-container h-full w-[85%]"></div>
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-on-surface-variant">Bet 75% Pot</span>
                  <span className="text-on-surface">3% frequency</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-primary-container h-full opacity-30 w-[3%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Core Metrics & Visual Range */}
          <div className="col-span-12 xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live HUD Stats */}
            <div className="bg-surface-container-high/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/5">
              <h3 className="text-on-surface-variant text-xs font-headline uppercase mb-6 tracking-wider">
                Equity &amp; Value
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-4 rounded-2xl">
                  <div className="text-xs text-on-surface-variant mb-1">
                    EV (Expected Value)
                  </div>
                  <div className="text-2xl md:text-3xl font-headline font-bold text-primary-fixed-dim">
                    +1.24 BB
                  </div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl">
                  <div className="text-xs text-on-surface-variant mb-1">
                    Win Probability
                  </div>
                  <div className="text-2xl md:text-3xl font-headline font-bold text-on-surface">
                    62%
                  </div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl">
                  <div className="text-xs text-on-surface-variant mb-1">
                    Pot Odds
                  </div>
                  <div className="text-2xl md:text-3xl font-headline font-bold text-on-surface">
                    3:1
                  </div>
                  <div className="text-[10px] text-on-surface-variant mt-1">
                    25% Equity Needed
                  </div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl">
                  <div className="text-xs text-on-surface-variant mb-1">
                    Implied Odds
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl md:text-3xl font-headline font-bold text-primary-container">
                      HIGH
                    </div>
                    <span className="material-symbols-outlined text-primary-container text-sm">
                      trending_up
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-outline-variant/10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-on-surface-variant uppercase">
                    Bluff Frequency Suggestion
                  </span>
                  <span className="text-lg font-bold text-on-surface">12%</span>
                </div>
                <div className="h-4 w-full bg-surface-container-lowest rounded-full overflow-hidden p-1">
                  <div className="h-full bg-error rounded-full shadow-[0_0_10px_rgba(255,180,171,0.5)] w-[12%]"></div>
                </div>
                <p className="text-[10px] text-on-surface-variant mt-4 italic leading-relaxed">
                  *Adjusted for current board texture (Ac 10d 7s 4h). Your range
                  contains limited nutted hands in this configuration.
                </p>
              </div>
            </div>

            {/* Opponent Range Map */}
            <div className="bg-surface-container-lowest p-6 rounded-[2rem] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-on-surface-variant text-xs font-headline uppercase tracking-wider">
                  Opponent Range
                </h3>
                <span className="px-2 py-1 bg-surface-container-high rounded text-[10px] text-primary-container font-mono">
                  BTN vs BB
                </span>
              </div>
              <div className="range-grid flex-1">
                {gridCells}
              </div>
              <div className="mt-4 flex gap-4 text-[10px] text-on-surface-variant font-medium">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary-container"></span>{" "}
                  100% Frequency
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-surface-container-high"></span>{" "}
                  0% Frequency
                </div>
              </div>
            </div>

            {/* AI Insight Narrative (Bottom Large Module) */}
            <div className="md:col-span-2 bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-[120px]">
                  psychology
                </span>
              </div>
              <div className="relative z-10">
                <h3 className="text-primary-container font-headline text-lg mb-4">
                  Deep Strategy Insight
                </h3>
                <p className="text-on-surface-variant text-lg leading-relaxed max-w-3xl">
                  The turn card <span className="text-on-surface font-bold">4h</span>{" "}
                  is relatively blank, but it doesn&apos;t improve your bluffing
                  range. By betting here, you are bloating a pot against a range
                  that is &quot;sticky&quot; with top-pair weak-kickers and flush draws.
                  <br />
                  <br />
                  <span className="text-on-surface underline decoration-primary-container underline-offset-4 font-semibold">
                    The Obsidian Move:
                  </span>{" "}
                  Check-call to realize your equity and keep the opponent&apos;s
                  bluffs in their range.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button className="bg-surface-container-highest px-6 py-3 rounded-xl text-on-surface hover:bg-surface-bright transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">
                      history
                    </span>{" "}
                    Review Similar Spots
                  </button>
                  <button className="bg-primary-container/10 border border-primary-container/20 px-6 py-3 rounded-xl text-primary-container hover:bg-primary-container/20 transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">
                      auto_graph
                    </span>{" "}
                    View GTO Tree
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-[#1C1B1B] flex justify-around items-center py-3 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <button className="flex flex-col items-center gap-1 text-[#BACCB0]">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px]">Dashboard</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#39FF14]">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            history
          </span>
          <span className="text-[10px]">Review</span>
        </button>
        <div className="bg-primary-container text-on-primary p-3 rounded-full -translate-y-6 shadow-lg shadow-primary-container/30 border-4 border-[#1C1B1B]">
          <span className="material-symbols-outlined">psychology</span>
        </div>
        <button className="flex flex-col items-center gap-1 text-[#BACCB0]">
          <span className="material-symbols-outlined">grid_view</span>
          <span className="text-[10px]">Ranges</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#BACCB0]">
          <span className="material-symbols-outlined">analytics</span>
          <span className="text-[10px]">Analytics</span>
        </button>
      </nav>
    </div>
  );
}

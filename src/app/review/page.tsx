import Image from "next/image";

export default function ReviewPage() {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary min-h-screen flex flex-col">
      {/* TopAppBar Shell */}
      <header className="bg-[#131313] flex justify-between items-center px-6 py-4 w-full z-50 sticky top-0 border-b border-outline-variant/10">
        <div className="flex items-center gap-8">
          <span className="text-xl font-black text-[#39FF14] tracking-tighter font-headline">
            OBSIDIAN INTELLECT
          </span>
          <nav className="hidden md:flex gap-6">
            <a
              className="font-headline font-bold tracking-tight text-[#BACCB0] hover:text-[#E5E2E1] transition-colors duration-300"
              href="#"
            >
              Live Practice
            </a>
            <a
              className="font-headline font-bold tracking-tight text-[#39FF14] border-b-2 border-[#39FF14] pb-1"
              href="#"
            >
              Hand Review
            </a>
            <a
              className="font-headline font-bold tracking-tight text-[#BACCB0] hover:text-[#E5E2E1] transition-colors duration-300"
              href="#"
            >
              Analytics
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-[#2A2A2A] transition-colors duration-300 text-[#39FF14]">
            <span className="material-symbols-outlined">
              account_balance_wallet
            </span>
          </button>
          <button className="p-2 rounded-full hover:bg-[#2A2A2A] transition-colors duration-300 text-[#BACCB0]">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
            <img
              alt="User"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLE7Q-0HigybXhf26yqWkz2m_H174C4hSTRXMethQG8VUNlc-pqtkW6aPSgiexajGtGqZYEXNTmYmyVnntwDB5AqtXUX7Ch5tjvxInyzLHkbmFSQbi04c_R1fg_c5GZTmO8GkZMvStGBvzZYaqpSa2y_gtIAuiqqQ0wwC4I7ekq8hUxN-t0Lxx7S0Djc9T2pf2q8ddZwEPEw9EYkmGBvq7W-OOzuw28xuH5lNbKOJtqkqcNJXdW1FmAYvCz-7A9zjEEDNpzGjmTno"
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* SideNavBar Shell */}
        <aside className="left-0 top-0 h-[calc(100vh-73px)] w-64 bg-[#1C1B1B] hidden lg:flex flex-col z-40 border-r border-[#2A2A2A] sticky">
          <div className="px-6 py-6 border-b border-[#2A2A2A] mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center border border-outline-variant">
                <span
                  className="material-symbols-outlined text-primary-container"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  psychology
                </span>
              </div>
              <div>
                <h3 className="font-headline text-[#39FF14] font-bold leading-none">
                  AI Coach
                </h3>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
                  Elite Intellect Active
                </p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-3 space-y-1">
            <a
              className="flex items-center gap-3 text-[#BACCB0] px-4 py-3 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all rounded-lg"
              href="#"
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span className="font-medium text-sm">Dashboard</span>
            </a>
            <a
              className="flex items-center gap-3 text-[#BACCB0] px-4 py-3 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all rounded-lg"
              href="#"
            >
              <span className="material-symbols-outlined">psychology</span>
              <span className="font-medium text-sm">Training</span>
            </a>
            <a
              className="flex items-center gap-3 bg-[#2A2A2A] text-[#39FF14] rounded-lg px-4 py-3 border-l-4 border-[#39FF14] transition-all"
              href="#"
            >
              <span className="material-symbols-outlined">history</span>
              <span className="font-medium text-sm">Hand History</span>
            </a>
            <a
              className="flex items-center gap-3 text-[#BACCB0] px-4 py-3 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all rounded-lg"
              href="#"
            >
              <span className="material-symbols-outlined">grid_view</span>
              <span className="font-medium text-sm">Range Lab</span>
            </a>
            <a
              className="flex items-center gap-3 text-[#BACCB0] px-4 py-3 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all rounded-lg"
              href="#"
            >
              <span className="material-symbols-outlined">analytics</span>
              <span className="font-medium text-sm">AI Insights</span>
            </a>
          </nav>
          <div className="p-4 border-t border-outline-variant/10">
            <button className="w-full bg-primary-container text-on-primary py-3 rounded-xl font-bold text-xs tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">bolt</span>
              UPGRADE TO PRO
            </button>
          </div>
          <div className="p-3 border-t border-outline-variant/10">
            <a
              className="flex items-center gap-3 text-[#BACCB0] px-4 py-3 hover:bg-[#2A2A2A] transition-all rounded-lg"
              href="#"
            >
              <span className="material-symbols-outlined">help</span>
              <span className="font-medium text-sm">Support</span>
            </a>
            <a
              className="flex items-center gap-3 text-[#BACCB0] px-4 py-3 hover:bg-[#2A2A2A] transition-all rounded-lg"
              href="#"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="font-medium text-sm">Logout</span>
            </a>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 bg-surface-dim overflow-y-auto">
          {/* Header Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            {/* Session Meta */}
            <div className="col-span-1 lg:col-span-8 flex flex-col justify-center">
              <h1 className="text-2xl md:text-3xl font-headline font-black text-on-surface tracking-tight mb-2">
                Hand #849202 - $2/$5 NLH
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-on-surface-variant text-xs md:text-sm">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">
                    calendar_today
                  </span>{" "}
                  Oct 24, 2023
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">
                    schedule
                  </span>{" "}
                  22:14 UTC
                </span>
                <span className="px-2 py-0.5 rounded-md bg-surface-container-high border border-outline-variant/30 text-[10px] font-bold tracking-tighter uppercase">
                  Ignition Poker
                </span>
              </div>
            </div>
            {/* Critical Mistakes Badge */}
            <div className="col-span-1 lg:col-span-4">
              <div className="bg-error-container/20 border-l-4 border-error p-4 rounded-xl flex items-start gap-4">
                <span
                  className="material-symbols-outlined text-error"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  error
                </span>
                <div>
                  <h4 className="text-error font-bold text-sm">
                    Critical Error on Flop
                  </h4>
                  <p className="text-on-surface-variant text-xs mt-1">
                    Folded best hand against a 35% bluff frequency. EV Loss:
                    -12.4 BB
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hand Replay Bento Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Column: Replayer */}
            <div className="col-span-1 xl:col-span-8 space-y-6">
              {/* Replay Section */}
              <section className="bg-surface-container-low rounded-3xl overflow-hidden relative border border-outline-variant/10 shadow-xl">
                <div
                  className="h-[300px] md:h-[440px] w-full flex items-center justify-center p-4 md:p-8 relative"
                  style={{
                    background:
                      "radial-gradient(circle at center, #1a3c1a 0%, #0e1a0e 70%, #0a0a0a 100%)",
                  }}
                >
                  {/* Poker Table Assets */}
                  <div
                    className="absolute inset-0 opacity-20 bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAJQbKhqS6nlRGf2ysHNgqtmulPgTeiw6qshtBDdEpns2-F_uDidvNqTgP_c8L8noj2HX50wv7dmmTpQo4ibK2fR1dXdnFVbyNMuRy15ZgujQY-VGXJnBmjdQ1kla_Uf77XmRDxnHKoyM9couK2GumHfoNBkJvUH2Dm4f4w8n6XvDqfS0NqnU5ZAaZO_FYU0z-1sBTzZCTOO84cZATpIJERR63XVvfjUdgAKJkmlY6YvkL2ho6ZZ5UUo-G8SEHavXn9H7ViKOLleSM')",
                    }}
                  ></div>

                  {/* Table Rim */}
                  <div className="w-full md:w-[85%] h-full md:h-[75%] border-[8px] md:border-[12px] border-surface-container-highest rounded-[100px] md:rounded-[160px] relative shadow-[0_0_100px_rgba(0,0,0,0.8)_inset]">
                    {/* Central Pot */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant opacity-60 mb-1">
                        Total Pot
                      </div>
                      <div className="text-xl md:text-2xl font-headline font-black text-primary-fixed-dim drop-shadow-[0_0_10px_rgba(57,255,20,0.3)]">
                        $142.50
                      </div>
                    </div>

                    {/* Players HUDs */}
                    {/* Hero (Bottom) */}
                    <div className="absolute bottom-[-30px] md:bottom-[-40px] left-1/2 -translate-x-1/2 bg-[#0E0E0E]/60 backdrop-blur-xl px-4 md:px-6 py-2 md:py-3 rounded-2xl border border-primary-container/20 shadow-2xl">
                      <div className="flex items-center gap-2 md:gap-4">
                        <div className="flex gap-1">
                          <div className="w-6 h-10 md:w-8 md:h-12 bg-white rounded-md flex flex-col items-center justify-center text-red-600 font-bold shadow-lg">
                            <span className="text-[10px] md:text-xs">A</span>
                            <span
                              className="material-symbols-outlined text-[10px] md:text-sm"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              favorite
                            </span>
                          </div>
                          <div className="w-6 h-10 md:w-8 md:h-12 bg-white rounded-md flex flex-col items-center justify-center text-red-600 font-bold shadow-lg">
                            <span className="text-[10px] md:text-xs">K</span>
                            <span
                              className="material-symbols-outlined text-[10px] md:text-sm"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              favorite
                            </span>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="text-primary-container text-[8px] md:text-[10px] font-bold tracking-widest">
                            HERO (SB)
                          </div>
                          <div className="text-on-surface font-bold text-xs md:text-base">
                            $482.00
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Opponent (Top) */}
                    <div className="absolute top-[-30px] md:top-[-40px] left-1/2 -translate-x-1/2 bg-[#0E0E0E]/60 backdrop-blur-xl px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-outline-variant/30 opacity-80">
                      <div className="text-center">
                        <div className="text-on-surface-variant text-[8px] md:text-[10px] font-medium">
                          Villain 1 (BTN)
                        </div>
                        <div className="text-on-surface font-bold text-xs md:text-sm">
                          $325.50
                        </div>
                        <div className="flex gap-1 justify-center mt-1">
                          <div className="w-3 h-5 md:w-4 md:h-6 bg-surface-container-highest border border-outline-variant/50 rounded-sm"></div>
                          <div className="w-3 h-5 md:w-4 md:h-6 bg-surface-container-highest border border-outline-variant/50 rounded-sm"></div>
                        </div>
                      </div>
                    </div>

                    {/* Community Cards */}
                    <div className="absolute top-[25%] md:top-1/3 left-1/2 -translate-x-1/2 flex gap-1 md:gap-2">
                      <div className="w-8 h-12 md:w-10 md:h-14 bg-white rounded-md flex flex-col items-center justify-center text-black font-bold shadow-lg border border-gray-200">
                        <span className="text-[10px] md:text-xs">Q</span>
                        <span className="material-symbols-outlined text-[10px] md:text-sm">
                          favorite
                        </span>
                      </div>
                      <div className="w-8 h-12 md:w-10 md:h-14 bg-white rounded-md flex flex-col items-center justify-center text-black font-bold shadow-lg border border-gray-200">
                        <span className="text-[10px] md:text-xs">J</span>
                        <span
                          className="material-symbols-outlined text-[10px] md:text-sm -mt-0.5"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          pentagon
                        </span>
                      </div>
                      <div className="w-8 h-12 md:w-10 md:h-14 bg-white rounded-md flex flex-col items-center justify-center text-black font-bold shadow-lg border border-gray-200">
                        <span className="text-[10px] md:text-xs">2</span>
                        <span
                          className="material-symbols-outlined text-[10px] md:text-sm -mt-0.5"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          pentagon
                        </span>
                      </div>
                      <div className="w-8 h-12 md:w-10 md:h-14 bg-surface-container/50 border border-outline-variant/30 rounded-md flex items-center justify-center text-outline-variant shadow-inner">
                        ?
                      </div>
                      <div className="w-8 h-12 md:w-10 md:h-14 bg-surface-container/50 border border-outline-variant/30 rounded-md flex items-center justify-center text-outline-variant shadow-inner">
                        ?
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scrubber / Timeline */}
                <div className="bg-surface-container-high p-4 flex flex-col gap-3 border-t border-outline-variant/10">
                  <div className="flex items-center justify-between text-[10px] text-on-surface-variant font-medium overflow-x-auto pb-1 gap-2">
                    <span className="shrink-0">PRE-FLOP</span>
                    <span className="text-primary-container shrink-0">
                      FLOP (CURRENT)
                    </span>
                    <span className="shrink-0">TURN</span>
                    <span className="shrink-0">RIVER</span>
                    <span className="shrink-0">SHOWDOWN</span>
                  </div>
                  <div className="relative w-full h-1.5 bg-surface-container-highest rounded-full cursor-pointer">
                    <div className="absolute top-0 left-0 w-[45%] h-full bg-primary-container rounded-full shadow-[0_0_10px_rgba(57,255,20,0.5)]"></div>
                    <div className="absolute top-1/2 left-[45%] -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-primary-container cursor-grab hover:scale-110 transition-transform"></div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 md:gap-4">
                      <button className="text-on-surface-variant hover:text-on-surface transition-colors p-1">
                        <span className="material-symbols-outlined">
                          first_page
                        </span>
                      </button>
                      <button className="text-on-surface-variant hover:text-on-surface transition-colors p-1">
                        <span className="material-symbols-outlined">
                          fast_rewind
                        </span>
                      </button>
                      <button className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.4)] hover:brightness-110 active:scale-95 transition-all">
                        <span
                          className="material-symbols-outlined"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          play_arrow
                        </span>
                      </button>
                      <button className="text-on-surface-variant hover:text-on-surface transition-colors p-1">
                        <span className="material-symbols-outlined">
                          fast_forward
                        </span>
                      </button>
                      <button className="text-on-surface-variant hover:text-on-surface transition-colors p-1">
                        <span className="material-symbols-outlined">
                          last_page
                        </span>
                      </button>
                    </div>
                    <div className="text-xs font-mono text-on-surface-variant">
                      Step 4 / 9
                    </div>
                  </div>
                </div>
              </section>

              {/* Stats Bento Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Aggression Score */}
                <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10 shadow-lg">
                  <h5 className="text-xs uppercase tracking-widest text-on-surface-variant mb-4">
                    Aggression Score
                  </h5>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl md:text-4xl font-headline font-black text-on-surface">
                      65%
                    </span>
                    <span className="text-primary-container text-xs font-bold mb-1 flex items-center bg-primary-container/10 px-1.5 py-0.5 rounded">
                      <span className="material-symbols-outlined text-[10px] mr-1">
                        trending_up
                      </span>{" "}
                      +5%
                    </span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-3">
                    Optimal range: 45% - 60%
                  </p>
                </div>

                {/* Positional Analysis */}
                <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10 shadow-lg">
                  <h5 className="text-xs uppercase tracking-widest text-on-surface-variant mb-4">
                    Positional Analysis
                  </h5>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-error">
                        warning
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-on-surface">
                        Weak from BB
                      </div>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">
                        High fold-to-steal %
                      </p>
                    </div>
                  </div>
                </div>

                {/* GTO Alignment */}
                <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10 shadow-lg">
                  <h5 className="text-xs uppercase tracking-widest text-on-surface-variant mb-4">
                    GTO Accuracy
                  </h5>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl md:text-4xl font-headline font-black text-on-surface">
                      82%
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-3">
                    <div className="bg-primary-container h-full rounded-full w-[82%] shadow-[0_0_5px_rgba(57,255,20,0.5)]"></div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[9px] text-on-surface-variant uppercase tracking-wider">
                      Top 5%
                    </span>
                    <span className="text-[9px] text-primary-container uppercase tracking-wider font-bold">
                      Accurate
                    </span>
                  </div>
                </div>
              </div>

              {/* EV Chart Placeholder */}
              <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h5 className="text-xs uppercase tracking-widest text-on-surface-variant">
                    Equity Fluctuations (EV)
                  </h5>
                  <div className="flex gap-4 text-[10px] font-bold">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_5px_rgba(57,255,20,0.5)]"></span>{" "}
                      REAL EV
                    </span>
                    <span className="flex items-center gap-1 opacity-70">
                      <span className="w-2 h-2 rounded-full bg-on-surface-variant"></span>{" "}
                      THEORETICAL
                    </span>
                  </div>
                </div>
                <div className="h-48 w-full relative">
                  <svg
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                    viewBox="0 0 400 100"
                  >
                    <path
                      d="M0 80 Q 50 20, 100 50 T 200 40 T 300 90 T 400 30"
                      fill="none"
                      stroke="#39FF14"
                      strokeLinecap="round"
                      strokeWidth="3"
                    ></path>
                    <path
                      d="M0 70 Q 60 40, 120 60 T 240 50 T 400 60"
                      fill="none"
                      opacity="0.4"
                      stroke="#BACCB0"
                      strokeDasharray="4"
                      strokeWidth="1"
                    ></path>
                    <circle cx="100" cy="50" fill="#39FF14" r="4"></circle>
                    <circle cx="300" cy="90" fill="#FFB4AB" r="4"></circle>
                  </svg>
                  <div className="absolute bottom-[-10px] left-0 w-full flex justify-between text-[10px] text-on-surface-variant font-mono">
                    <span>Pre</span>
                    <span>Flop</span>
                    <span>Turn</span>
                    <span>River</span>
                    <span>SD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Action Log & Insights */}
            <div className="col-span-1 xl:col-span-4 space-y-6">
              {/* Action Log */}
              <section className="bg-surface-container-low rounded-3xl border border-outline-variant/10 flex flex-col h-[400px] xl:h-[600px] shadow-lg">
                <div className="p-5 border-b border-outline-variant/10 sticky top-0 bg-surface-container-low/90 backdrop-blur z-10 rounded-t-3xl">
                  <h5 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">
                    Action Log
                  </h5>
                </div>
                <div className="p-4 flex-1 overflow-y-auto space-y-6 custom-scrollbar text-sm">
                  {/* Pre-Flop */}
                  <div>
                    <div className="text-[10px] font-bold text-on-surface-variant mb-2 px-2 uppercase tracking-widest">
                      Pre-Flop
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high/40 hover:bg-surface-container-high transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-on-surface-variant w-8">
                            BTN
                          </span>
                          <span className="font-bold">Raise to $15</span>
                        </div>
                        <span className="bg-primary-container/10 text-primary-container text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                          Correct
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-primary-container font-bold w-8">
                            SB
                          </span>
                          <span className="font-bold">3-Bet to $45</span>
                        </div>
                        <span className="bg-primary-container/10 text-primary-container text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                          Correct
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Flop */}
                  <div>
                    <div className="text-[10px] font-bold text-on-surface-variant mb-2 px-2 flex items-center gap-2">
                      <span className="uppercase tracking-widest">
                        Flop (Current)
                      </span>
                      <span className="bg-surface-container-highest px-1.5 py-0.5 rounded text-white tracking-widest font-mono">
                        Q♥ J♠ 2♠
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high border-l-2 border-error/50">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-primary-container font-bold w-8">
                            SB
                          </span>
                          <span className="font-bold">Check</span>
                        </div>
                        <span className="text-error text-[10px] font-bold uppercase">
                          Missed Val
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high/40 hover:bg-surface-container-high transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-on-surface-variant w-8">
                            BTN
                          </span>
                          <span className="font-bold">Bet $30</span>
                        </div>
                        <span className="bg-primary-container/10 text-primary-container text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                          Correct
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high border-l-4 border-error relative overflow-hidden">
                        <div className="absolute inset-0 bg-error/5 opactiy-20"></div>
                        <div className="flex items-center gap-3 relative z-10">
                          <span className="text-xs text-primary-container font-bold w-8">
                            SB
                          </span>
                          <span className="font-bold text-error">Fold</span>
                        </div>
                        <span className="bg-error text-on-error text-[10px] px-2 py-0.5 rounded font-bold uppercase relative z-10 shadow-lg">
                          Inaccurate
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Missed Opportunities */}
              <section className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10 shadow-lg">
                <h5 className="text-xs uppercase tracking-widest text-on-surface-variant mb-4 font-bold">
                  Missed Opportunities
                </h5>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-highest/50 border border-outline-variant/5">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-tertiary-container text-sm">
                        attach_money
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-on-surface">
                        Missed Value Bet
                      </div>
                      <p className="text-[10px] text-on-surface-variant leading-relaxed mt-1">
                        Should have C-Bet 33% pot.{" "}
                        <span className="text-error font-bold bg-error/10 px-1 rounded">
                          +4 BB lost
                        </span>{" "}
                        in theoretical value.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-highest/50 border border-outline-variant/5">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary-container text-sm">
                        visibility
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-on-surface">
                        Missed Bluff Opportunity
                      </div>
                      <p className="text-[10px] text-on-surface-variant leading-relaxed mt-1">
                        Villain&apos;s range on J-high boards is highly inelastic
                        to large leads.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Quick Tools */}
              <div className="flex gap-3">
                <button className="flex-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface py-4 rounded-2xl font-bold text-xs transition-colors border border-outline-variant/20 hover:border-outline-variant/40 flex flex-col items-center gap-1 shrink-0">
                  <span className="material-symbols-outlined text-sm">
                    share
                  </span>
                  <span>SHARE HAND</span>
                </button>
                <button className="flex-1 bg-primary-container/10 hover:bg-primary-container/20 text-primary-container py-4 rounded-2xl font-bold text-xs transition-colors border border-primary-container/30 flex flex-col items-center gap-1 shrink-0">
                  <span className="material-symbols-outlined text-sm">
                    download
                  </span>
                  <span>EXPORT GTO</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-[#1C1B1B] flex justify-around items-center py-3 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] border-t border-outline-variant/10">
        <button className="flex flex-col items-center gap-1 text-[#BACCB0]">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px]">Dashboard</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#BACCB0]">
          <span className="material-symbols-outlined">psychology</span>
          <span className="text-[10px]">Training</span>
        </button>
        <div className="bg-[#2A2A2A] text-[#39FF14] p-3 rounded-full -translate-y-4 shadow-lg border border-[#39FF14]/30">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            history
          </span>
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

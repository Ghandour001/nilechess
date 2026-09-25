import Link from 'next/link';
import { Play, Bot, Users, Settings, BarChart2, BookOpen, Tv, Puzzle } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex-1 bg-[var(--background)] pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TOP SECTION: 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          
          {/* LEFT: HERO & PLAY */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-2xl flex flex-col justify-center min-h-[320px]">
              <h1 className="text-4xl font-black text-white tracking-tight leading-tight mb-4">
                Play Chess <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Your Way</span>
              </h1>
              <p className="text-[var(--text-muted)] text-sm font-medium leading-relaxed mb-8">
                Fast games, deep analysis, and a global chess community — completely free.
              </p>
              
              <div className="space-y-3">
                <Link href="/play" className="w-full py-4 rounded-xl font-black text-[15px] tracking-wide text-white bg-gradient-to-b from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 border border-sky-400/20 transition shadow-[0_0_15px_rgba(2,132,199,0.3)] flex items-center justify-center gap-3">
                  <Play size={18} className="fill-white" />
                  PLAY ONLINE
                </Link>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/play?mode=computer" className="py-3 rounded-xl font-bold text-sm text-zinc-200 bg-[var(--surface-hover)] hover:bg-[var(--surface-alt)] border border-[var(--border)] transition flex items-center justify-center gap-2">
                    <Bot size={16} className="text-sky-400" />
                    Computer
                  </Link>
                  <Link href="/play?mode=friend" className="py-3 rounded-xl font-bold text-sm text-zinc-200 bg-[var(--surface-hover)] hover:bg-[var(--surface-alt)] border border-[var(--border)] transition flex items-center justify-center gap-2">
                    <Users size={16} className="text-emerald-400" />
                    A Friend
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER: QUICK PLAY */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-2xl flex flex-col min-h-[320px]">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-white">Quick Play</h2>
                <Link href="/play" className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1">
                  <Settings size={12} />
                  Custom
                </Link>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-6">Choose a time control and start playing instantly.</p>
              
              <div className="flex-1 grid grid-cols-3 gap-2 auto-rows-fr">
                {[
                  { l: '1+0', c: 'Bullet' }, { l: '1+1', c: 'Bullet' }, { l: '2+1', c: 'Bullet' },
                  { l: '3+0', c: 'Blitz' }, { l: '3+2', c: 'Blitz' }, { l: '5+0', c: 'Blitz' },
                  { l: '5+3', c: 'Blitz' }, { l: '10+0', c: 'Rapid' }, { l: '10+5', c: 'Rapid' },
                  { l: '15+10', c: 'Rapid' }, { l: '30+0', c: 'Classic' }, { l: '30+20', c: 'Classic' }
                ].map((tc, i) => (
                  <Link 
                    key={i} 
                    href={`/play?time=${tc.l}`}
                    className="rounded-xl bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-sky-500/50 flex flex-col items-center justify-center transition p-2"
                  >
                    <span className="text-sm font-bold text-zinc-200 leading-tight mb-0.5">{tc.l}</span>
                    <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-wide">{tc.c}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: PUZZLE & ANALYSIS */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Daily Puzzle */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-2xl flex items-center gap-5 flex-1">
              <div className="w-28 h-28 shrink-0 rounded shadow-md border border-[var(--border)] bg-[var(--surface-alt)] flex items-center justify-center">
                 <Puzzle size={32} className="text-purple-500/50" />
              </div>
              <div className="flex flex-col flex-1">
                <h3 className="font-bold text-white mb-1 flex items-center gap-2">
                  <Puzzle size={14} className="text-purple-400" /> Daily Puzzle
                </h3>
                <p className="text-xs text-[var(--text-muted)] mb-3">Solve tactical positions</p>
                <Link href="/puzzles" className="w-full py-2 rounded-lg font-bold text-xs text-white bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 transition text-center">
                  Solve Puzzle
                </Link>
              </div>
            </div>

            {/* Analysis */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-2xl flex-1 flex flex-col justify-center">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                <BarChart2 size={14} className="text-sky-400" /> Analysis Board
              </h3>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Review your games with Stockfish. Import PGNs or set up custom FEN positions.
              </p>
              <Link href="/analysis" className="w-full py-2.5 rounded-lg font-bold text-xs text-white bg-[var(--surface-hover)] hover:bg-[var(--surface-alt)] border border-[var(--border)] hover:border-sky-500/30 transition text-center">
                Open Analysis
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: LEARN / WATCH / RECENT GAMES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Learn */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-lg flex flex-col">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen size={16} className="text-emerald-400" /> Learn
            </h3>
            <div className="grid grid-cols-2 gap-3 flex-1">
              {['Chess Basics', 'Tactics', 'Openings', 'Endgames'].map((item) => (
                <Link key={item} href="/learn" className="py-2.5 px-3 rounded-xl bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-semibold text-zinc-300 transition text-center flex items-center justify-center">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Watch */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-lg flex flex-col">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Tv size={16} className="text-rose-400" /> Watch
            </h3>
            <div className="grid grid-cols-2 gap-3 flex-1">
              {['Live Games', 'Featured', 'Community', 'Archive'].map((item) => (
                <Link key={item} href="/watch" className="py-2.5 px-3 rounded-xl bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-semibold text-zinc-300 transition text-center flex items-center justify-center">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Games */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center text-center">
            <h3 className="font-bold text-white mb-2">Recent Games</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">No recent games yet.</p>
            <Link href="/play" className="px-5 py-2 text-xs font-bold bg-[var(--surface-hover)] hover:bg-[var(--surface-alt)] text-white rounded-lg transition border border-[var(--border)]">
              Play a Game
            </Link>
          </div>
        </div>
        
        {/* PLATFORM STATS */}
        {/* We remove fake stats as requested, use an empty honest state until backend is wired up */}
        <div className="mt-8 pt-8 border-t border-[var(--border)] flex flex-wrap justify-center gap-8 text-center opacity-70">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Players Online</p>
            <p className="text-lg font-mono font-bold text-zinc-300">—</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Games In Progress</p>
            <p className="text-lg font-mono font-bold text-zinc-300">—</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Games Today</p>
            <p className="text-lg font-mono font-bold text-zinc-300">—</p>
          </div>
        </div>

      </div>
    </main>
  );
}

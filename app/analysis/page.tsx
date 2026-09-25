'use client';

import { useState, useEffect, useCallback } from 'react';
import Chessboard from '@/components/chess/Chessboard';
import EvalBar from '@/components/chess/EvalBar';
import { useLocalChess, type Square } from '@/hooks/chess/useLocalChess';
import { useStockfish } from '@/hooks/engine/useStockfish';
import { Activity, Copy, RotateCcw, ArrowLeft, ArrowRight, Upload } from 'lucide-react';

export default function AnalysisPage() {
  const {
    chess,
    fen,
    turnColor,
    lastMove,
    checkSquare,
    legalMoves,
    history,
    makeMove,
    reset,
    load
  } = useLocalChess();

  const { engineState, bestMove, evalScore, evalDepth, search, stop } = useStockfish();

  const [orientation, setOrientation] = useState<'white'|'black'>('white');
  const [fenInput, setFenInput] = useState(fen);

  // Sync fen input with actual fen unless user is typing
  useEffect(() => {
    setFenInput(fen);
  }, [fen]);

  // Run engine analysis on every move
  useEffect(() => {
    stop();
    // Start infinite search for analysis
    const timer = setTimeout(() => {
      search(fen, 24, 20); // max difficulty for analysis
    }, 500);
    return () => clearTimeout(timer);
  }, [fen, search, stop]);

  const handleMove = useCallback((orig: string, dest: string, promotion?: string) => {
    makeMove(orig as any, dest as any, promotion || 'q');
  }, [makeMove]);

  const handleLoadFen = () => {
    load(fenInput);
  };

  return (
    <div className="flex-1 h-[calc(100dvh-56px)] max-h-[calc(100dvh-56px)] w-full overflow-y-auto lg:overflow-hidden bg-[var(--background)]">
      <div className="h-full w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row p-2 lg:p-4 gap-4 lg:gap-6">
        
        {/* Board Column */}
        <div className="flex-1 min-h-0 min-w-0 flex flex-col gap-2 lg:gap-3 shrink-0 lg:shrink">
          <div className="flex-1 min-h-0 min-w-0 flex items-center justify-center relative flex-row gap-2">
            
            <EvalBar score={evalScore} orientation={orientation} />

            <div className="h-full max-w-full aspect-square relative flex items-center justify-center">
              <div className="absolute inset-0">
                <Chessboard
                  fen={fen}
                  legalMoves={legalMoves}
                  turnColor={turnColor}
                  orientation={orientation}
                  lastMove={lastMove as any}
                  checkSquare={checkSquare}
                  onMove={handleMove as any}
                />
              </div>
            </div>

          </div>
          
          {/* FEN Input & Controls */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 shadow-md flex items-center gap-3 shrink-0">
            <input 
              value={fenInput}
              onChange={e => setFenInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLoadFen()}
              className="flex-1 bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-zinc-300 font-mono outline-none focus:border-[var(--accent-light)] transition"
              placeholder="Paste FEN..."
            />
            <button 
              onClick={handleLoadFen}
              className="px-4 py-2 bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg text-sm font-bold text-white transition flex items-center gap-2"
            >
              <Upload size={16} /> Load
            </button>
            <button className="p-2 bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg text-[var(--text-muted)] hover:text-white transition" title="Copy FEN" onClick={() => navigator.clipboard.writeText(fen)}>
              <Copy size={16} />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col rounded-xl overflow-hidden bg-[var(--surface)] border border-[var(--border)] shadow-xl h-auto min-h-[400px]">
          
          {/* Engine Header */}
          <div className="p-3 border-b border-[var(--border)] bg-[var(--surface-hover)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Activity size={16} className={engineState === 'thinking' ? 'text-sky-400 animate-pulse' : 'text-[var(--text-muted)]'} />
              <span className="text-sm font-bold text-white">Stockfish 16.1 NNUE</span>
            </div>
            <div className="text-xs font-semibold text-[var(--text-muted)]">
              Depth {evalDepth}
            </div>
          </div>

          {/* Engine Output */}
          <div className="p-4 border-b border-[var(--border)] bg-[#0A101A] flex flex-col justify-center shrink-0">
            <div className="flex items-end justify-between mb-1">
              <span className={`text-2xl font-black font-mono ${evalScore?.startsWith('+') ? 'text-white' : evalScore?.startsWith('-') ? 'text-zinc-400' : 'text-sky-400'}`}>
                {evalScore || '0.00'}
              </span>
              {bestMove && <span className="text-xs text-emerald-400 font-mono font-bold">Best: {bestMove}</span>}
            </div>
          </div>
          
          {/* Move List */}
          <div className="flex-1 overflow-y-auto p-4 bg-[var(--surface)]">
            <div className="flex flex-wrap gap-1">
              {history.length === 0 ? (
                <div className="w-full text-center text-sm text-[var(--text-muted)] font-semibold mt-4">
                  Make a move to start analyzing.
                </div>
              ) : (
                history.map((move, i) => (
                  <span key={i} className={`text-sm ${i % 2 === 0 ? 'font-bold text-[var(--text-muted)] mr-1' : 'text-zinc-300 mr-3'}`}>
                    {i % 2 === 0 ? `${i/2 + 1}. ` : ''}{move}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Tools */}
          <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-alt)] flex gap-2 shrink-0">
            <button className="flex-1 py-3 rounded-lg font-bold text-xs bg-[var(--surface-hover)] hover:bg-[var(--border)] transition border border-[var(--border)] flex items-center justify-center gap-2 text-white" onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')}>
              <RotateCcw size={16} /> Flip Board
            </button>
            <button className="flex-1 py-3 rounded-lg font-bold text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition flex items-center justify-center gap-2" onClick={reset}>
              Clear Board
            </button>
          </div>

        </aside>
      </div>
    </div>
  );
}

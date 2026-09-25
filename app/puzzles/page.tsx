'use client';

import { Puzzle, RefreshCw, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Chessboard from '@/components/chess/Chessboard';
import { useLocalChess } from '@/hooks/chess/useLocalChess';

// Simple local puzzle dataset
const PUZZLES = [
  {
    id: 'p1',
    rating: 1200,
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1',
    moves: ['f3e5', 'c6e5', 'd2d4'], // White to move
    orientation: 'white' as const,
  },
  {
    id: 'p2',
    rating: 1550,
    fen: '6k1/1p3pp1/p6p/8/P7/1P3P1P/2rr2P1/1R2R1K1 b - - 0 1',
    moves: ['d2g2', 'g1h1', 'g2h2', 'h1g1', 'c2g2', 'g1f1', 'g2b2', 'f1g1'], // Black to move
    orientation: 'black' as const,
  }
];

export default function PuzzlesPage() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzle = PUZZLES[puzzleIndex];
  
  const { fen, makeMove, load, legalMoves, turnColor, checkSquare, lastMove } = useLocalChess();
  const [moveIndex, setMoveIndex] = useState(0);
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong' | 'solved'>('playing');

  // Load puzzle
  useEffect(() => {
    load(puzzle.fen);
    setMoveIndex(0);
    setStatus('playing');
  }, [puzzle, load]);

  const handleMove = (orig: string, dest: string, promotion?: string) => {
    if (status === 'solved' || status === 'wrong') return;
    
    // Construct simple move string
    const moveStr = orig + dest + (promotion && promotion !== 'q' ? promotion : '');
    const expectedMove = puzzle.moves[moveIndex];

    const isCorrect = moveStr === expectedMove || 
      // sometimes expected might just be orig+dest
      moveStr.startsWith(expectedMove);

    if (isCorrect) {
      makeMove(orig, dest, promotion);
      
      if (moveIndex + 1 >= puzzle.moves.length) {
        setStatus('solved');
        import('@/lib/audio/ChessAudio').then(({ chessAudio }) => chessAudio.gameStart()); // success sound
      } else {
        setStatus('correct');
        setMoveIndex(prev => prev + 1);
        
        // Make opponent's response
        setTimeout(() => {
          const resp = puzzle.moves[moveIndex + 1];
          const rOrig = resp.substring(0, 2);
          const rDest = resp.substring(2, 4);
          const rProm = resp.length > 4 ? resp[4] : undefined;
          makeMove(rOrig, rDest, rProm);
          setMoveIndex(prev => prev + 1);
          setStatus('playing');
        }, 500);
      }
    } else {
      // Wrong move - try to make it to show it, then revert
      const success = makeMove(orig, dest, promotion);
      if (success) {
        setStatus('wrong');
        import('@/lib/audio/ChessAudio').then(({ chessAudio }) => chessAudio.warning()); // failure sound
        setTimeout(() => {
          // simple undo via reload and replay
          load(puzzle.fen);
          for (let i = 0; i < moveIndex; i++) {
            const m = puzzle.moves[i];
            makeMove(m.substring(0, 2), m.substring(2, 4), m.length > 4 ? m[4] : undefined);
          }
          setStatus('playing');
        }, 1000);
      }
    }
  };

  const nextPuzzle = () => {
    setPuzzleIndex((prev) => (prev + 1) % PUZZLES.length);
  };

  return (
    <div className="flex-1 h-[calc(100dvh-56px)] max-h-[calc(100dvh-56px)] w-full overflow-y-auto lg:overflow-hidden bg-[var(--background)]">
      <div className="h-full w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row p-2 lg:p-4 gap-4 lg:gap-6">
        
        <div className="flex-1 min-h-0 min-w-0 flex items-center justify-center relative">
          <div className="h-full max-w-full aspect-square relative flex items-center justify-center">
            <div className="absolute inset-0">
              <Chessboard
                fen={fen}
                legalMoves={status === 'playing' || status === 'correct' ? legalMoves : undefined}
                turnColor={turnColor}
                orientation={puzzle.orientation}
                onMove={handleMove as any}
                lastMove={lastMove as any}
                checkSquare={checkSquare}
              />
            </div>
          </div>
        </div>

        <aside className="w-full lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col rounded-xl overflow-hidden bg-[var(--surface)] border border-[var(--border)] shadow-xl h-auto min-h-[400px] p-6 items-center">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
            <Puzzle size={24} className="text-purple-400" />
          </div>
          
          <h1 className="text-xl font-black text-white mb-1">Puzzle #{puzzle.id}</h1>
          <div className="text-sm font-bold text-[var(--accent-light)] mb-6">Rating: {puzzle.rating}</div>
          
          <div className="w-full p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-hover)] mb-6 text-center">
            {status === 'playing' && (
              <div className="text-sm font-semibold text-white">Find the best move</div>
            )}
            {status === 'correct' && (
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-400">
                <CheckCircle size={18} /> Best move! Keep going.
              </div>
            )}
            {status === 'wrong' && (
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-rose-400">
                <XCircle size={18} /> Incorrect. Try again.
              </div>
            )}
            {status === 'solved' && (
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-sky-400">
                <CheckCircle size={18} /> Puzzle Solved!
              </div>
            )}
          </div>

          <div className="mt-auto w-full">
            {status === 'solved' ? (
              <button 
                onClick={nextPuzzle}
                className="w-full py-3 rounded-lg font-bold text-sm text-white bg-gradient-to-b from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow transition flex items-center justify-center gap-2"
              >
                Next Puzzle <ChevronRight size={18} />
              </button>
            ) : (
              <button 
                onClick={() => {
                  load(puzzle.fen);
                  setMoveIndex(0);
                  setStatus('playing');
                }}
                className="w-full py-3 rounded-lg font-bold text-sm text-zinc-300 bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} /> Retry
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

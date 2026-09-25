'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

import Chessboard from '@/components/chess/Chessboard';
import PlayerBar from '@/components/game/PlayerBar';
import { useLocalChess, type Square } from '@/hooks/chess/useLocalChess';
import { useStockfish } from '@/hooks/engine/useStockfish';
import { useChessClock, formatTime } from '@/hooks/game/useChessClock';
import { useMatchmaking } from '@/hooks/game/useMatchmaking';
import { useRealtimeGame } from '@/hooks/game/useRealtimeGame';
import { TIME_CONTROLS, type GameMode, type TimeControlOption } from './types';
import { Flag, Handshake, RefreshCw, Bot, Users, Globe, Loader2, X } from 'lucide-react';

const BOARD_SZ = 'min(calc(100vh - 140px), 580px)';
const BAR_W    = BOARD_SZ;

import { Suspense } from 'react';

function PlayPageContent() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get('mode') as GameMode) || 'lobby';
  const initialTime = searchParams.get('time') || '10+0';

  const [gameMode, setGameMode] = useState<GameMode>(initialMode);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTimeId, setSelectedTimeId] = useState(() => {
    const found = TIME_CONTROLS.find(t => t.label === initialTime);
    return found ? found.id : '10min';
  });

  const [opponentName, setOpponentName] = useState('Opponent');
  const [opponentRating, setOpponentRating] = useState<number | undefined>(undefined);
  const [difficulty, setDifficulty] = useState(10); // 0-20 for Stockfish

  const {
    fen,
    turnColor,
    lastMove,
    checkSquare,
    isGameOver,
    legalMoves,
    history,
    makeMove,
    load: loadFen,
    reset: resetChess,
  } = useLocalChess();
  
  const { engineState, bestMove, search, stop: stopEngine } = useStockfish();
  const { isSearching, matchFound, findMatch, cancelSearch } = useMatchmaking();
  
  // Connect to the match if one is found
  const { remoteFen, remoteLastMove, sendMove } = useRealtimeGame(matchFound);

  const selectedTime = TIME_CONTROLS.find((tc) => tc.id === selectedTimeId) || TIME_CONTROLS[7];
  
  // Parse time control (e.g., "10+5")
  const [minutes, increment] = useMemo(() => {
    const parts = selectedTime.label.split('+');
    return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
  }, [selectedTime.label]);

  const handleTimeout = useCallback((color: string) => {
    console.log(`${color} lost on time`);
    setIsPlaying(false);
    import('@/lib/audio/ChessAudio').then(({ chessAudio }) => chessAudio.gameEnd());
  }, []);

  const { clock, start: startClock, pause: pauseClock, switchTurn: switchClock, reset: resetClock } = useChessClock(
    minutes,
    increment,
    handleTimeout
  );

  // When engine finds a move, play it
  useEffect(() => {
    if (gameMode === 'computer' && bestMove && turnColor === 'black' && !isGameOver && isPlaying) {
      const from = bestMove.substring(0, 2) as Square;
      const to = bestMove.substring(2, 4) as Square;
      const promotion = bestMove.length > 4 ? bestMove[4] : 'q';
      makeMove(from, to, promotion);
      switchClock('white');
    }
  }, [bestMove, gameMode, turnColor, isGameOver, isPlaying, makeMove, switchClock]);

  // When turn changes to computer, trigger search
  useEffect(() => {
    if (gameMode === 'computer' && turnColor === 'black' && !isGameOver && isPlaying) {
      const timer = setTimeout(() => {
        search(fen, 10, difficulty);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [turnColor, gameMode, isGameOver, isPlaying, fen, search, difficulty]);

  // When remote move arrives, play it
  useEffect(() => {
    if (gameMode === 'online' && remoteFen && remoteFen !== fen && isPlaying) {
      loadFen(remoteFen);
      switchClock('white'); // Assume we are white for now in mock mode
    }
  }, [remoteFen, gameMode, isPlaying, fen, loadFen, switchClock]);

  // When match is found, start game
  useEffect(() => {
    if (matchFound && !isPlaying) {
      resetChess();
      resetClock();
      setGameMode('online');
      setOpponentName('Online Player');
      setOpponentRating(1500);
      setIsPlaying(true);
      startClock('white');
    }
  }, [matchFound, isPlaying, resetChess, resetClock, startClock]);

  // Handle game over logic
  useEffect(() => {
    if (isGameOver && isPlaying) {
      setIsPlaying(false);
      pauseClock();
      stopEngine();
    }
  }, [isGameOver, isPlaying, pauseClock, stopEngine]);

  const startGame = (mode: GameMode) => {
    if (mode === 'online') {
      findMatch(selectedTime.label);
      return;
    }

    import('@/lib/audio/ChessAudio').then(({ chessAudio }) => chessAudio.gameStart());

    resetChess();
    resetClock();
    setGameMode(mode);
    
    if (mode === 'computer') {
      setOpponentName('Stockfish');
      setOpponentRating(Math.round(1000 + (difficulty / 20) * 1500));
    } else if (mode === 'local') {
      setOpponentName('Local Player 2');
      setOpponentRating(undefined);
    }
    
    setIsPlaying(true);
    startClock('white');
  };

  const handleResign = () => {
    setIsPlaying(false);
    pauseClock();
    stopEngine();
  };

  const handleMove = useCallback((orig: string, dest: string, promotion?: string) => {
    if (!isPlaying || isGameOver || (gameMode === 'computer' && turnColor === 'black')) return;
    
    const success = makeMove(orig as any, dest as any, promotion || 'q');
    if (success) {
      if (gameMode === 'online') {
        sendMove(fen, orig, dest);
      }

      if (gameMode === 'computer') {
        switchClock('black');
      } else {
        switchClock(turnColor === 'white' ? 'black' : 'white');
      }
    }
  }, [isPlaying, isGameOver, gameMode, turnColor, makeMove, switchClock, sendMove, fen]);

  return (
    <div className="flex-1 h-[calc(100dvh-56px)] max-h-[calc(100dvh-56px)] w-full overflow-y-auto lg:overflow-hidden bg-[var(--background)]">
      <div className="h-full w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row p-2 lg:p-4 gap-4 lg:gap-6">
        
        {/* Game Column */}
        <div className="flex-1 min-h-0 min-w-0 flex flex-col gap-2 lg:gap-3 shrink-0 lg:shrink">
          
          <div className="h-12 shrink-0">
            <PlayerBar
              name={opponentName}
              rating={opponentRating}
              isBottom={false}
              clockTime={isPlaying || isGameOver ? formatTime(clock.blackTime) : selectedTime.clockTime}
              isActive={isPlaying && clock.activeColor === 'black'}
            />
          </div>

          <div className="flex-1 min-h-0 min-w-0 flex items-center justify-center relative">
            <div className="h-full max-w-full aspect-square relative flex items-center justify-center">
              <div className="absolute inset-0">
                <Chessboard
                  fen={fen}
                  legalMoves={isPlaying ? legalMoves : undefined}
                  turnColor={turnColor}
                  lastMove={lastMove as any}
                  checkSquare={checkSquare}
                  viewOnly={!isPlaying || (gameMode === 'computer' && turnColor === 'black')}
                  onMove={handleMove as any}
                />
              </div>
              
              {/* Matchmaking Overlay */}
              {isSearching && (
                <div className="absolute inset-0 bg-[#0A101A]/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded">
                  <Loader2 size={48} className="text-[var(--accent-light)] animate-spin mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2 text-center px-4">Searching for Opponent</h3>
                  <p className="text-sm text-[var(--text-muted)] mb-6">{selectedTime.category} • {selectedTime.label} • ~1200 Elo</p>
                  <button onClick={cancelSearch} className="px-6 py-2 rounded-full font-bold text-sm bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/50 transition flex items-center gap-2">
                    <X size={16} /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="h-12 shrink-0">
            <PlayerBar
              name="You"
              rating={1500}
              isBottom={true}
              clockTime={isPlaying || isGameOver ? formatTime(clock.whiteTime) : selectedTime.clockTime}
              isActive={isPlaying && clock.activeColor === 'white'}
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col rounded-xl overflow-hidden bg-[var(--surface)] border border-[var(--border)] shadow-xl h-auto min-h-[400px]">

          {!isPlaying && !isGameOver ? (
            <div className="flex flex-col h-full p-4 overflow-y-auto">
              <h2 className="text-xl font-black text-white mb-6 text-center">New Game</h2>
              
              <div className="mb-6">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Time Control</label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_CONTROLS.map(tc => (
                    <button
                      key={tc.id}
                      onClick={() => setSelectedTimeId(tc.id)}
                      className={`p-2 rounded-lg border text-sm font-bold transition ${
                        selectedTimeId === tc.id 
                          ? 'bg-[var(--surface-hover)] border-[var(--accent-light)] text-[var(--accent-light)]' 
                          : 'bg-[var(--surface-alt)] border-[var(--border)] text-zinc-300 hover:border-zinc-500'
                      }`}
                    >
                      {tc.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Computer Difficulty</label>
                <input 
                  type="range" 
                  min="0" max="20" 
                  value={difficulty} 
                  onChange={e => setDifficulty(parseInt(e.target.value))}
                  className="w-full accent-[var(--accent-light)]"
                />
                <div className="text-center text-sm font-semibold text-zinc-300 mt-1">Level {difficulty}</div>
              </div>

              <div className="mt-auto space-y-3 pt-4">
                <button 
                  onClick={() => startGame('online')}
                  className="w-full py-4 rounded-xl font-black text-sm text-white bg-gradient-to-b from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 transition shadow flex items-center justify-center gap-2"
                >
                  <Globe size={18} /> Play Online
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => startGame('computer')}
                    className="py-3 rounded-xl font-bold text-xs text-zinc-200 bg-[var(--surface-hover)] hover:bg-[var(--surface-alt)] transition border border-[var(--border)] flex items-center justify-center gap-1.5"
                  >
                    <Bot size={14} /> Computer
                  </button>
                  <button 
                    onClick={() => startGame('local')}
                    className="py-3 rounded-xl font-bold text-xs text-zinc-200 bg-[var(--surface-hover)] hover:bg-[var(--surface-alt)] transition border border-[var(--border)] flex items-center justify-center gap-1.5"
                  >
                    <Users size={14} /> Local
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full min-h-0">
              <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-hover)] shrink-0">
                <div className="text-sm font-bold text-white flex justify-between items-center">
                  <span>{selectedTime.label} • {gameMode === 'computer' ? 'vs Computer' : gameMode === 'online' ? 'Online' : 'Local'}</span>
                  {isGameOver && <span className="text-[var(--accent-light)]">Game Over</span>}
                </div>
              </div>
              
              {/* Move List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-[var(--surface)]">
                {Array.from({ length: Math.ceil(history.length / 2) }).map((_, i) => (
                  <div key={i} className="flex text-sm font-medium">
                    <div className="w-10 text-[var(--text-muted)] text-right pr-3 shrink-0">{i + 1}.</div>
                    <div className={`flex-1 px-2 py-1 rounded ${history.length - 1 === i*2 ? 'bg-[var(--surface-hover)] text-[var(--accent-light)]' : 'text-zinc-300'}`}>
                      {history[i * 2]}
                    </div>
                    <div className={`flex-1 px-2 py-1 rounded ${history.length - 1 === i*2 + 1 ? 'bg-[var(--surface-hover)] text-[var(--accent-light)]' : 'text-zinc-300'}`}>
                      {history[i * 2 + 1] || ''}
                    </div>
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-alt)] flex gap-2 shrink-0">
                {!isGameOver ? (
                  <>
                    <button onClick={handleResign} className="flex-1 py-3 rounded-lg font-bold text-xs text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition flex flex-col items-center justify-center gap-1 border border-rose-500/20">
                      <Flag size={16} /> Resign
                    </button>
                    <button className="flex-1 py-3 rounded-lg font-bold text-xs text-zinc-400 bg-black/20 hover:bg-black/40 transition flex flex-col items-center justify-center gap-1 border border-[var(--border)]">
                      <Handshake size={16} /> Draw
                    </button>
                  </>
                ) : (
                  <button onClick={() => { setIsPlaying(false); resetChess(); }} className="w-full py-3 rounded-lg font-bold text-sm text-[var(--accent-light)] bg-[var(--surface-hover)] hover:bg-[var(--surface)] border border-[var(--border)] transition flex items-center justify-center gap-2">
                    <RefreshCw size={16} /> New Game
                  </button>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-white">Loading...</div>}>
      <PlayPageContent />
    </Suspense>
  );
}

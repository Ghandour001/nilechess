import { useState, useCallback, useMemo } from 'react';
import { Chess, Move } from 'chess.js';
import { chessAudio } from '@/lib/audio/ChessAudio';

export type Square = string;
export type Color = 'white' | 'black';
export type LegalMoves = Map<Square, Square[]>;

export function useLocalChess() {
  const [chess] = useState(() => new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [lastMove, setLastMove] = useState<[Square, Square] | undefined>();
  
  const updateState = useCallback(() => {
    setFen(chess.fen());
  }, [chess]);

  const makeMove = useCallback((orig: Square, dest: Square, promotion: string = 'q') => {
    try {
      const move = chess.move({ from: orig, to: dest, promotion });
      if (move) {
        setLastMove([orig, dest]);
        updateState();
        
        // Play sound based on move characteristics
        if (chess.inCheck()) {
          chessAudio.check();
        } else if (move.flags.includes('c') || move.flags.includes('e')) {
          chessAudio.capture();
        } else {
          chessAudio.move();
        }
        
        if (chess.isGameOver()) {
          chessAudio.gameEnd();
        }
        
        return true;
      }
    } catch (e) {
      // Invalid move
      return false;
    }
    return false;
  }, [chess, updateState]);

  const reset = useCallback(() => {
    chess.reset();
    setLastMove(undefined);
    updateState();
  }, [chess, updateState]);

  const load = useCallback((newFen: string) => {
    try {
      chess.load(newFen);
      setLastMove(undefined);
      updateState();
      return true;
    } catch (e) {
      return false;
    }
  }, [chess, updateState]);

  // Compute legal moves
  const legalMoves = useMemo((): LegalMoves => {
    const d = new Map<Square, Square[]>();
    if (chess.isGameOver()) return d;
    
    const moves = chess.moves({ verbose: true }) as Move[];
    for (const m of moves) {
      if (!d.has(m.from)) d.set(m.from, []);
      d.get(m.from)!.push(m.to);
    }
    return d;
  }, [chess, fen]);

  // Determine checked king square if in check
  const checkSquare = useMemo((): Square | undefined => {
    if (!chess.inCheck()) return undefined;
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === chess.turn()) {
          return piece.square;
        }
      }
    }
    return undefined;
  }, [chess, fen]);

  return {
    chess,
    fen,
    turnColor: (chess.turn() === 'w' ? 'white' : 'black') as Color,
    lastMove,
    isCheck: chess.inCheck(),
    checkSquare,
    isGameOver: chess.isGameOver(),
    legalMoves,
    history: chess.history(), // array of move strings (SAN)
    makeMove,
    reset,
    load,
  };
}

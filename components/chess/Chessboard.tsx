'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Piece from './Piece';
import clsx from 'clsx';

export type Square = string;
export type Color = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type LegalMoves = Map<Square, Square[]>;

export interface ChessboardProps {
  fen: string;
  legalMoves?: LegalMoves;
  turnColor?: 'white' | 'black';
  orientation?: 'white' | 'black';
  viewOnly?: boolean;
  lastMove?: [Square, Square];
  checkSquare?: Square;
  onMove?: (orig: Square, dest: Square, promotion?: string) => void;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

interface PieceData {
  id: string; // unique ID to preserve DOM elements during moves (helps with transitions)
  type: PieceType;
  color: Color;
  square: Square;
}

function parseFen(fen: string): PieceData[] {
  const pieces: PieceData[] = [];
  const [position] = fen.split(' ');
  const rows = position.split('/');
  
  // Track piece counts to generate unique IDs, e.g. "w-p-1"
  const counts: Record<string, number> = {};

  rows.forEach((row, r) => {
    let c = 0;
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (/\d/.test(char)) {
        c += parseInt(char, 10);
      } else {
        const sq = `${FILES[c]}${RANKS[r]}` as Square;
        const color = char === char.toUpperCase() ? 'w' : 'b';
        const type = char.toLowerCase() as PieceType;
        const key = `${color}-${type}`;
        counts[key] = (counts[key] || 0) + 1;
        
        // ID generation isn't perfect across takes/promotions just from FEN, 
        // but since we usually just diff this state, React will try to match keys.
        // We will just use the square as key if we don't care about perfect transition across captures,
        // but for smooth transitions, the key should ideally follow the piece.
        // Since we only get FEN, we can't reliably track piece identity across identical pieces.
        // We will just use `${color}${type}-${sq}` as a fallback, or just use `sq` and let React transition it.
        // Wait, if a piece moves from e2 to e4, the square changes!
        // So the key MUST NOT be the square if we want CSS transitions!
        pieces.push({
          id: `${color}${type}-${counts[key]}`, // this might swap identities of two same pieces, but usually fine
          type,
          color,
          square: sq,
        });
        c++;
      }
    }
  });
  
  // Try to stabilize IDs across renders by matching closest previous positions if we had previous state.
  // For a truly perfect animation from FEN, we'd need a diff algorithm. FEN doesn't carry identity.
  return pieces;
}

const Chessboard = ({
  fen,
  legalMoves,
  turnColor = 'white',
  orientation = 'white',
  viewOnly = false,
  lastMove,
  checkSquare,
  onMove,
}: ChessboardProps) => {
  const boardRef = useRef<HTMLDivElement>(null);
  
  const [selected, setSelected] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ orig: Square, dest: Square } | null>(null);

  // Parse FEN into an array of pieces for absolute positioning
  // We use useMemo to avoid re-parsing if fen hasn't changed.
  // To get smooth transitions, we really need a stateful piece tracker that diffs FEN.
  const [pieces, setPieces] = useState<PieceData[]>([]);
  
  useEffect(() => {
    // Simple diffing algorithm to preserve IDs across FEN changes for smooth CSS transitions
    const newPieces = parseFen(fen);
    setPieces(currentPieces => {
      if (currentPieces.length === 0) return newPieces;
      
      const mappedNewPieces: PieceData[] = [];
      const availableCurrent = [...currentPieces];
      
      newPieces.forEach(np => {
        // Find exact match first (same type, color, square)
        let matchIdx = availableCurrent.findIndex(cp => cp.type === np.type && cp.color === np.color && cp.square === np.square);
        
        if (matchIdx === -1) {
          // Find piece that moved (same type, color, different square)
          // Ideally we look for a piece that is in the `lastMove[0]` if we knew it.
          // Since we might not, we just grab the first available of same type & color.
          matchIdx = availableCurrent.findIndex(cp => cp.type === np.type && cp.color === np.color);
        }
        
        if (matchIdx !== -1) {
          mappedNewPieces.push({ ...np, id: availableCurrent[matchIdx].id });
          availableCurrent.splice(matchIdx, 1);
        } else {
          // It's a new piece (e.g. promotion)
          mappedNewPieces.push(np);
        }
      });
      
      return mappedNewPieces;
    });
  }, [fen]);

  // Drag state
  const [draggingPiece, setDraggingPiece] = useState<string | null>(null); // Piece ID
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 }); // Mouse position relative to board
  const [dragOrig, setDragOrig] = useState<Square | null>(null);

  const getSquareFromClientXY = (clientX: number, clientY: number): Square | null => {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || x > rect.width || y < 0 || y > rect.height) return null;
    
    const fileIdx = Math.floor((x / rect.width) * 8);
    const rankIdx = Math.floor((y / rect.height) * 8);
    
    const f = orientation === 'white' ? fileIdx : 7 - fileIdx;
    const r = orientation === 'white' ? rankIdx : 7 - rankIdx;
    
    return `${FILES[f]}${RANKS[r]}` as Square;
  };

  const getSquareCoords = (sq: Square) => {
    const f = FILES.indexOf(sq[0]);
    const r = RANKS.indexOf(sq[1]);
    const x = orientation === 'white' ? f : 7 - f;
    const y = orientation === 'white' ? r : 7 - r;
    return { left: `${x * 12.5}%`, top: `${y * 12.5}%` };
  };

  // --- Pointer Handlers for Custom Drag ---
  const handlePointerDown = (e: React.PointerEvent, piece: PieceData) => {
    if (viewOnly || pendingPromotion) return;
    if (piece.color !== (turnColor === 'white' ? 'w' : 'b')) return;

    // e.preventDefault(); // Prevent scroll while dragging on mobile? Might break touch sometimes, but needed for custom drag.
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    
    setDraggingPiece(piece.id);
    setDragOrig(piece.square);
    setSelected(piece.square);

    const rect = boardRef.current!.getBoundingClientRect();
    setDragPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingPiece || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    setDragPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!draggingPiece) return;
    
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    
    const destSq = getSquareFromClientXY(e.clientX, e.clientY);
    
    if (destSq && dragOrig && destSq !== dragOrig) {
      if (legalMoves?.get(dragOrig)?.includes(destSq)) {
        // Check promotion
        const p = pieces.find(x => x.id === draggingPiece);
        if (p && p.type === 'p') {
          if ((p.color === 'w' && destSq[1] === '8') || (p.color === 'b' && destSq[1] === '1')) {
            setPendingPromotion({ orig: dragOrig, dest: destSq });
            setDraggingPiece(null);
            return;
          }
        }
        onMove?.(dragOrig, destSq);
        setSelected(null);
      }
    }
    
    setDraggingPiece(null);
  };

  const handleSquareClick = (sq: Square) => {
    if (viewOnly || pendingPromotion) return;

    if (selected && legalMoves?.has(selected)) {
      const dests = legalMoves.get(selected);
      if (dests?.includes(sq)) {
        const p = pieces.find(x => x.square === selected);
        if (p && p.type === 'p') {
          if ((p.color === 'w' && sq[1] === '8') || (p.color === 'b' && sq[1] === '1')) {
            setPendingPromotion({ orig: selected, dest: sq });
            return;
          }
        }
        onMove?.(selected, sq);
        setSelected(null);
        return;
      }
    }

    const p = pieces.find(x => x.square === sq);
    if (p && p.color === (turnColor === 'white' ? 'w' : 'b')) {
      setSelected(sq);
    } else {
      setSelected(null);
    }
  };

  const squares = useMemo(() => {
    const sqs: Square[] = [];
    const ranks = orientation === 'white' ? RANKS : [...RANKS].reverse();
    const files = orientation === 'white' ? FILES : [...FILES].reverse();
    for (const r of ranks) {
      for (const f of files) {
        sqs.push(`${f}${r}` as Square);
      }
    }
    return sqs;
  }, [orientation]);

  return (
    <div 
      ref={boardRef}
      className="relative w-full h-full aspect-square shadow-2xl rounded-sm border-[3px] border-[#2c3e50] bg-[#1a252f] overflow-hidden select-none touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Background Squares Grid */}
      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
        {squares.map((sq) => {
          const fileIdx = FILES.indexOf(sq[0]);
          const rankIdx = RANKS.indexOf(sq[1]);
          const isDark = (fileIdx + rankIdx) % 2 === 1;
          
          const isSelected = selected === sq;
          const isLastMove = lastMove?.includes(sq);
          const isCheck = checkSquare === sq;
          
          const isLegalDest = selected ? legalMoves?.get(selected)?.includes(sq) : false;
          const hasPiece = pieces.some(p => p.square === sq);
          const isLegalCapture = isLegalDest && hasPiece;
          const isLegalEmpty = isLegalDest && !hasPiece;

          // NileChess Midnight board colors
          const bgColor = isDark ? '#476380' : '#DDE3E9';
          
          let overlayColor = 'transparent';
          if (isSelected) overlayColor = 'rgba(2, 132, 199, 0.45)';
          else if (isCheck) overlayColor = 'radial-gradient(ellipse at center, rgba(239,68,68,1) 0%, rgba(239,68,68,0.7) 25%, rgba(169,0,0,0) 89%, rgba(158,0,0,0) 100%)';
          else if (isLastMove) overlayColor = 'rgba(56, 189, 248, 0.3)';

          const isLeftEdge = orientation === 'white' ? sq[0] === 'a' : sq[0] === 'h';
          const isBottomEdge = orientation === 'white' ? sq[1] === '1' : sq[1] === '8';

          return (
            <div
              key={sq}
              className="relative flex items-center justify-center"
              style={{ backgroundColor: bgColor }}
              onClick={() => handleSquareClick(sq)}
            >
              <div className="absolute inset-0 pointer-events-none" style={{ background: overlayColor }} />
              {isLegalEmpty && <div className="absolute w-[25%] h-[25%] rounded-full bg-black/25 pointer-events-none" />}
              {isLegalCapture && <div className="absolute w-[80%] h-[80%] rounded-full border-[5px] border-black/20 pointer-events-none" />}
              
              {isLeftEdge && (
                <span className="absolute top-0.5 left-1 font-bold text-[10px] pointer-events-none opacity-80" style={{ color: isDark ? '#DDE3E9' : '#476380' }}>
                  {sq[1]}
                </span>
              )}
              {isBottomEdge && (
                <span className="absolute bottom-0 right-1 font-bold text-[10px] pointer-events-none opacity-80" style={{ color: isDark ? '#DDE3E9' : '#476380' }}>
                  {sq[0]}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Pieces Layer */}
      {pieces.map(piece => {
        const isDragging = piece.id === draggingPiece;
        const coords = getSquareCoords(piece.square);
        
        let style: React.CSSProperties = {
          left: coords.left,
          top: coords.top,
          width: '12.5%',
          height: '12.5%',
          zIndex: isDragging ? 100 : 10,
        };

        if (isDragging) {
          // When dragging, bind center of piece to cursor
          style = {
            ...style,
            transform: `translate(calc(${dragPos.x}px - 50%), calc(${dragPos.y}px - 50%))`,
            left: 0,
            top: 0,
            transition: 'none',
            cursor: 'grabbing'
          };
        } else {
          // Smooth animate to new position when not dragging
          style = {
            ...style,
            transition: 'left 0.2s ease, top 0.2s ease',
            cursor: (!viewOnly && piece.color === (turnColor === 'white' ? 'w' : 'b')) ? 'grab' : 'default'
          };
        }

        return (
          <div
            key={piece.id}
            className="absolute p-[1.5%]"
            style={style}
            onPointerDown={(e) => handlePointerDown(e, piece)}
          >
            <Piece type={piece.type} color={piece.color} className="pointer-events-none" />
          </div>
        );
      })}

      {/* Promotion Modal */}
      {pendingPromotion && (() => {
        const sq = pendingPromotion.dest;
        const f = FILES.indexOf(sq[0]);
        const x = orientation === 'white' ? f : 7 - f;
        const isTop = sq[1] === '8';
        
        return (
          <div 
            className={clsx(
              "absolute w-[12.5%] h-[50%] bg-white z-[200] flex flex-col shadow-2xl rounded-sm overflow-hidden",
              isTop ? "top-0" : "bottom-0"
            )}
            style={{ left: `${x * 12.5}%`, flexDirection: isTop ? 'column' : 'column-reverse' }}
          >
            {['q', 'n', 'r', 'b'].map(promoType => (
              <div
                key={promoType}
                className="flex-1 flex items-center justify-center hover:bg-black/10 cursor-pointer p-1"
                onClick={() => {
                  onMove?.(pendingPromotion.orig, pendingPromotion.dest, promoType);
                  setPendingPromotion(null);
                  setSelected(null);
                }}
              >
                <Piece type={promoType as PieceType} color={turnColor === 'white' ? 'w' : 'b'} className="w-[80%] h-[80%] pointer-events-none" />
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
};

export default React.memo(Chessboard);

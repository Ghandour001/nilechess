import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '../auth/useAuth';

export function useRealtimeGame(gameId: string | null) {
  const { user } = useAuth();
  const [remoteFen, setRemoteFen] = useState<string | null>(null);
  const [remoteLastMove, setRemoteLastMove] = useState<{ orig: string; dest: string } | null>(null);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'active' | 'finished'>('waiting');
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);
  
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!gameId) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }
    
    const channel = supabase.channel(`game:${gameId}`);
    channelRef.current = channel;

    if (!user) return;

    channel
      .on('broadcast', { event: 'move' }, ({ payload }) => {
        setRemoteFen(payload.fen);
        setRemoteLastMove({ orig: payload.orig, dest: payload.dest });
      })
      .on('broadcast', { event: 'status' }, ({ payload }) => {
        setGameStatus(payload.status);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Connected
        }
      });

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [gameId, user]);

  const sendMove = useCallback((fen: string, orig: string, dest: string) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'move',
        payload: { fen, orig, dest, userId: user?.id },
      });
    }
  }, [user]);

  const resign = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'status',
        payload: { status: 'finished', winner: playerColor === 'white' ? 'black' : 'white' },
      });
    }
  }, [playerColor]);

  return { remoteFen, remoteLastMove, gameStatus, playerColor, sendMove, resign, setPlayerColor };
}

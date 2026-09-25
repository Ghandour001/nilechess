import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '../auth/useAuth';

export function useMatchmaking() {
  const { user } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const [matchFound, setMatchFound] = useState<string | null>(null);

  // Use a shared presence channel for matchmaking queue
  const lobbyChannel = supabase.channel('lobby:matchmaking');

  useEffect(() => {
    if (!user) return;

    lobbyChannel.on('broadcast', { event: 'match_found' }, ({ payload }) => {
      if (payload.player1 === user.id || payload.player2 === user.id) {
        setIsSearching(false);
        setMatchFound(payload.gameId);
      }
    });

    return () => {
      supabase.removeChannel(lobbyChannel);
    };
  }, [user]);

  const findMatch = useCallback(async (timeControl: string) => {
    if (!user) {
      alert("Sign in to play online.");
      return;
    }
    setIsSearching(true);
    setMatchFound(null);
    
    lobbyChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Broadcast that we are looking for a game
        lobbyChannel.send({
          type: 'broadcast',
          event: 'seek',
          payload: { userId: user.id, timeControl, rating: 1500 }
        });

        // In a real implementation with a backend (Edge Function / Postgres Trigger),
        // the server would listen to 'seek' events, pair players, create a game row, 
        // and broadcast 'match_found'.
        
        // Mock fallback for frontend-only testing:
        setTimeout(() => {
          // If no backend responds, mock finding a match to allow UI testing
          if (isSearching) {
            setMatchFound(`mock-game-${Date.now()}`);
            setIsSearching(false);
          }
        }, 3000);
      }
    });
  }, [user, isSearching]);

  const cancelSearch = useCallback(() => {
    setIsSearching(false);
    lobbyChannel.unsubscribe();
  }, []);

  return { isSearching, matchFound, findMatch, cancelSearch };
}

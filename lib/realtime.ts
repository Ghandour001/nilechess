import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type GameEvent = 
  | { type: 'move'; move: string; fen: string; timeRemaining: number }
  | { type: 'resign'; color: 'white' | 'black' }
  | { type: 'draw_offer'; color: 'white' | 'black' }
  | { type: 'draw_accept' };

export class RealtimeGameService {
  private channel: RealtimeChannel | null = null;

  constructor(private gameId: string, private onEvent: (event: GameEvent) => void) {}

  subscribe() {
    this.channel = supabase.channel(`game:${this.gameId}`);
    
    this.channel
      .on('broadcast', { event: 'game_event' }, (payload) => {
        this.onEvent(payload.payload as GameEvent);
      })
      .subscribe((status) => {
        console.log(`[Realtime] Game ${this.gameId} subscription status:`, status);
      });
  }

  sendEvent(event: GameEvent) {
    if (!this.channel) return;
    this.channel.send({
      type: 'broadcast',
      event: 'game_event',
      payload: event,
    });
  }

  unsubscribe() {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
  }
}

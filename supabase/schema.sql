-- NILECHESS POSTGRESQL SCHEMA FOUNDATION
-- Designed for Supabase

-- 1. Profiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  rating_bullet INTEGER DEFAULT 1200,
  rating_blitz INTEGER DEFAULT 1200,
  rating_rapid INTEGER DEFAULT 1200,
  rating_classical INTEGER DEFAULT 1200,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Games
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  white_player_id UUID REFERENCES public.profiles(id),
  black_player_id UUID REFERENCES public.profiles(id),
  time_control TEXT NOT NULL, -- e.g., "10+5"
  status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress, finished, aborted
  result TEXT, -- "1-0", "0-1", "1/2-1/2", null
  termination_reason TEXT, -- checkmate, resignation, timeout, stalemate, draw_agreement, aborted
  initial_fen TEXT DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  pgn TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  finished_at TIMESTAMP WITH TIME ZONE
);

-- 3. Moves (Optional: for realtime move-by-move persistence instead of just final PGN)
CREATE TABLE public.moves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  move_number INTEGER NOT NULL,
  player_id UUID REFERENCES public.profiles(id),
  san TEXT NOT NULL, -- Standard Algebraic Notation
  fen_after TEXT NOT NULL,
  time_remaining_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_games_white_player ON public.games(white_player_id);
CREATE INDEX idx_games_black_player ON public.games(black_player_id);
CREATE INDEX idx_games_status ON public.games(status);
CREATE INDEX idx_moves_game_id ON public.moves(game_id);

-- RLS (Row Level Security) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moves ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Games are viewable by everyone." ON public.games FOR SELECT USING (true);
CREATE POLICY "Moves are viewable by everyone." ON public.moves FOR SELECT USING (true);

-- Authenticated update access for own profile
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

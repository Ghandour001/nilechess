# Architectural Assessment & Phase 1 Implementation Plan

## 1. Existing Architecture & Technical Debt

**Current State:**
- The entire application (Homepage, Lobby, Play Area, Game State, Layout) is squashed into a single 500+ line `app/page.tsx` file.
- Game state (`isPlaying`, `history`, `currentTurn`, `opponentName`, `opponentRating`) is managed using raw `useState` hooks mixed with UI presentation logic.
- UI elements like `PlayerBar` and `TimeControl` buttons are embedded directly within the monolithic file or rely on complex inline styling.
- `Chessboard.tsx` wraps `chessground`, but its logic and state updates are tightly coupled with `page.tsx` via the `onMove` callback.
- **Technical Debt:** High coupling between domain logic (chess game state) and UI presentation. Lack of dedicated routes for Landing vs. Play. No extensible state management suitable for multiplayer or complex local modes. Hardcoded player data.

## 2. Target Architecture (Production-Grade)

To build NILECHESS into a serious platform capable of scaling with Supabase and Realtime multiplayer, we must adopt a layered architecture:

**Routing Layer:**
- `/` - Landing Page (Hero, Features, "Play Now" CTAs).
- `/play` - Central play route.
- `/play/computer` - Play vs. Stockfish.
- `/play/online` - Matchmaking & Multiplayer (Future).
- `/analysis` - Game analysis and engine evaluation.

**Domain Layer (Game State):**
- Separate the chess logic from the React UI. Use a robust state manager (like Zustand) or a dedicated Context/Reducer (`GameProvider`) to hold:
  - FEN / Board State
  - Move History
  - Timers / Clocks
  - Game Status (Active, Draw, Resign, Checkmate)
- The UI should strictly subscribe to this state and dispatch intents (`makeMove`, `resign`, `offerDraw`).

**Presentation Layer (Design System):**
- Break down UI into highly reusable components:
  - `Layout`: Zero-Scroll master layout.
  - `Lobby`: Game mode selection, time controls.
  - `GameArea`: Central board container.
  - `PlayerBadge`: Standardized player info card.
  - `MoveList`: Notation table.

**Infrastructure Layer:**
- `supabase`: Setup for Auth and DB.
- `engine`: Stockfish WebWorker integration decoupled from UI components.

## 3. Implementation Phases

**Phase 1: Core Refactoring & Local Play (Current Objective)**
- Extract Landing Page to `app/page.tsx` and move Play logic to `app/play/page.tsx`.
- Refactor the giant UI into clean components (`Lobby`, `Sidebar`, `GameArea`, `PlayerBadge`).
- Implement a clean React Context (`GameContext`) for local state management (FEN, History, Turn).
- Implement Time Controls and local clock logic.
- Maintain the "Midnight Nile" aesthetic and zero-scroll layout.

**Phase 2: Engine Integration (Next)**
- Re-integrate `useStockfish` for "Play vs Computer" mode.
- Add engine analysis and the `EvalBar`.

**Phase 3: Multiplayer & Persistence (Future)**
- Integrate Supabase Auth.
- Use Supabase Realtime (or similar) to sync moves across clients.
- Persist games and move history to PostgreSQL.

---

Executing Phase 1 Immediately...

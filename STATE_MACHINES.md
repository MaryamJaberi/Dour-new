# State machines in «دور – Turn»

A map of the state machines that live implicitly in `App.tsx`, for people and agents.
Read this before touching navigation or game flow, and update it when you add a state.

## 1. Screen navigation (`currentScreen`)

`INTRO → SETUP → CATEGORIES → PLAYERS → SEATING_CONFIRM → GAME`, with Back going one step left.
`INTRO → HISTORY → INTRO`. `GAME → INTRO` on exit.
`HELP` is an overlay reachable from any screen; it remembers `prevScreen` and returns there.

## 2. Game flow (`gameStatus: GameStatus`, `types.ts`)

`Splash → Setup → SeatingConfirm → ActiveTurn ⇄ Paused`, `ActiveTurn → RoundEnded → ActiveTurn`,
then `GameEnded / WinnerScreen`, which are terminal: resume never leaves them.

## 3. The two must agree

`currentScreen` and `gameStatus` describe one thing and are always set together in the same handler:

| gameStatus | currentScreen |
|---|---|
| Splash | INTRO |
| Setup | INTRO, SETUP, CATEGORIES, PLAYERS |
| SeatingConfirm | SEATING_CONFIRM |
| ActiveTurn, Paused, RoundEnded, GameEnded, WinnerScreen | GAME (or HELP over GAME) |

## 4. Rules that are easy to break

- Help pauses and later resumes the game **only** if a turn was running (`helpPausedTurnRef`).
  Opening help while already paused or between rounds returns to that same state.
- Resume draws a new word on purpose (so a pause cannot be used to think about the word).
- `isPoolExhausted` is a second flag next to `gameStatus`; set it only where the pool pointer moves.

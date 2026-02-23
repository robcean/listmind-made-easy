# ListMind Frontend — Claude Instructions

## Project
ADHD-friendly list manager PWA. React + TypeScript + Vite + Zustand + Tailwind + shadcn/ui.

## Architecture
- This is the frontend for the OpenClaw version (port 8080)
- Backend lives at `/root/adhd-app-openclaw/` (Fastify + Prisma + PostgreSQL, port 3001)
- AI: OpenClaw gateway on port 18789
- DO NOT touch anything on port 80 (Kimi K2 version, frozen)

## Commands
- `npm run build` — Production build to dist/
- `npm run dev` — Dev server (rarely used, nginx serves dist/)
- After changes: `npm run build` then verify in browser

## Conventions
- Respond in Spanish when the user writes in Spanish
- No hardcoded metadata fields — everything is dynamic via Object.entries()
- Recurrence is freeform string, not enum
- i18n keys in `src/i18n/index.ts` — always add both EN and ES
- Prefer editing existing files over creating new ones
- Only commit when explicitly asked

## Key Patterns
- Store: Zustand with persist middleware (only language persisted)
- API: `src/services/api.ts` — all functions use shared `request()` helper
- Types: `src/types/index.ts` — must match backend API contract
- Actions from chat: ChatView handles store updates, then refreshes from server

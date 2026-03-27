# Athlete Race History

> A production-grade **"My Results" module** for athlete platforms — drop it into any Next.js + FastAPI app and give your users a fully-featured, editable race history page. No Strava dependency. No third-party lock-in.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://athlete-race-history.vercel.app/preview/my-results)
[![TypeScript](https://img.shields.io/badge/TypeScript-88%25-blue)](#stack)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688)](#stack)
[![Next.js](https://img.shields.io/badge/frontend-Next.js%2015-black)](#stack)

---

## What it does

Athletes on your platform get a dedicated **My Results** page where they can:

- Browse their full race history, grouped by year
- Mark a result as a **Personal Best**
- Correct finish times and add timing links — inline, no modal
- Hide results they don't want on their public profile
- Unclaim results that aren't theirs

All mutations update optimistically and roll back cleanly on error. Built with Server Components, so the initial load is fast and SEO-friendly.

---

## Live demo

```
https://athlete-race-history.vercel.app/preview/my-results
```

Renders 15 mock races — including a PB, a hidden result, and an unconfirmed result — so you can see every card variant without a backend.

---

## Project structure

```
frontend/src/
  app/
    my-results/page.tsx          ← Server Component (auth-agnostic)
    preview/my-results/page.tsx  ← Mock preview, no backend needed
  components/my-results/
    MyResultsView.tsx            ← Client Component — filters, year groups, mutations
    RaceCard.tsx                 ← Card variants + menu + inline edit
  lib/
    types.ts                     ← RaceResult, RacePatch, Runner
    api.ts                       ← getRunner(), patchRace()

backend/app/
  schemas/race.py                ← RaceResult + RacePatch Pydantic models
  api/race_patch.py              ← PATCH /runners/{id}/races/{race_id} endpoint
  services/backfill.py           ← Lazy UUID migration for existing race records
```

---

## Features

| Feature | Detail |
|---|---|
| **Year-grouped list** | Races grouped by year, newest first, collapsible |
| **Filter bar** | All / Hidden segmented control + Unclaimed-only checkbox |
| **Card variants** | Default, ★ Personal Best (amber), Hidden (faded), Unconfirmed (amber border) |
| **Context menu** | Edit time or link / Hide from profile / Not my race |
| **Inline edit** | `finish_time` and `timing_link` editable in place — no modal |
| **Unclaim flow** | Inline confirmation replaces the card |
| **Optimistic updates** | UI updates instantly, rolls back on API error |
| **Preview mode** | Full mock render — no backend required |

---

## Frontend integration

### 1. Install dependencies

```bash
npm install lucide-react
```

### 2. Copy files into your Next.js app

Copy `frontend/src/` into your project. Set `NEXT_PUBLIC_API_URL` in your `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-api.com/api
```

### 3. Wire up auth in `my-results/page.tsx`

The page ships with a `?runner_id=` URL param as a placeholder. Replace it with your app's session logic:

```typescript
// Example: read runner_id from your own session cookie
import { cookies } from 'next/headers'

const cookieStore = await cookies()
const session = JSON.parse(cookieStore.get('your_session')?.value ?? '{}')
const runner_id = session.runner_id
```

`MyResultsView` only needs three props: `runner_id`, `initialRaces`, and `athleteName`. Everything else is auth-agnostic.

### 4. Set the back link

```tsx
<MyResultsView
  initialRaces={runner.race_results}
  runnerId={runner.id}
  athleteName={runner.name}
  backHref="/profile"  {/* ← your app's profile page */}
/>
```

### 5. Preview without a backend

Navigate to `/preview/my-results` to see all card variants rendered from mock data.

---

## Backend integration

### 1. Add the schemas

Merge `backend/app/schemas/race.py` fields (`id`, `timing_link`, `hidden`, `claimed`) into your existing `RaceResult` schema.

### 2. Register the PATCH endpoint

```python
# In your existing runners router
from app.api.race_patch import router as race_patch_router
app.include_router(race_patch_router, prefix="/runners", tags=["runners"])
```

### 3. Backfill existing races (optional, zero-downtime)

If you have race records without `id` fields, call `backfill_race_ids` at the top of your `GET /runners/{id}` handler:

```python
from app.services.backfill import backfill_race_ids

@router.get("/{runner_id}")
async def get_runner(runner_id: str, db=Depends(get_db)):
    runner = await service.get_runner(runner_id)
    await backfill_race_ids(runner, db)  # no-ops if all ids present
    ...
```

---

## API contract

```
GET  /runners/{runner_id}
     → Runner { id, name, race_results: RaceResult[] }

PATCH /runners/{runner_id}/races/{race_id}
     Body: { finish_time?, timing_link?, hidden?, claimed? }
     → RaceResult (updated)
```

---

## Design decisions & iteration log

This module was built iteratively. Key decisions made along the way:

**Optimistic updates over loading states** — Mutation feedback is instant; errors roll back with a toast. Avoids the spinner-heavy UX common in CRUD dashboards.

**Server Component shell, Client Component core** — `page.tsx` fetches data server-side (fast initial load, works without JS). `MyResultsView` is a single client boundary for interactivity.

**Inline edit over modal** — Editing finish time and timing link in-card reduces context switching. The card expands; no route change, no focus trap to manage.

**Lazy UUID backfill** — Rather than a one-time migration script, race IDs are backfilled lazily on the first `GET /runners/{id}` call. Zero-downtime, zero coordination.

**Auth-agnostic by design** — The module ships with a `?runner_id=` URL param placeholder so it can be demoed and evaluated without a full auth stack. Swap in one place.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15+ (App Router, Server Components) |
| UI | React 19, Tailwind CSS v4, lucide-react |
| Backend | FastAPI + SQLAlchemy (async) |
| Validation | Pydantic v1 |
| Deployment | Vercel (frontend), compatible with any Python host |

---

## Getting started locally

```bash
# Frontend
cd frontend
npm install
npm run dev
# Visit http://localhost:3000/preview/my-results

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## Contributing

Pull requests are welcome. If you're adapting this for a different athlete platform or sport, open an issue — happy to make the module more configurable.

---

*Built with Next.js 15, FastAPI, and a runner's appreciation for clean race data.*

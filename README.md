# WONE — Athlete Race History

Standalone module for athletes to view and manage their race history.
Designed to drop into any Next.js + FastAPI app — no Strava dependency.

---

## What's in here

```
frontend/src/
  app/
    my-results/page.tsx          ← Server Component (auth-agnostic)
    preview/my-results/page.tsx  ← Mock preview, no backend needed
  components/my-results/
    MyResultsView.tsx            ← Client Component — filters, year groups, mutations
    RaceCard.tsx                 ← Card variants + ⋮ menu + inline edit
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

- **Year-grouped list** — races grouped by year, newest first, collapsible
- **Filter bar** — All / Hidden segmented control + Unclaimed only checkbox
- **Card variants** — default, ★ Personal Best (amber), hidden (faded), unconfirmed (amber border)
- **⋮ menu** — Edit time or link / Hide from profile / Not my race
- **Inline edit** — finish_time and timing_link editable in place, no modal
- **Unclaim confirm** — inline confirmation replaces the card
- **Optimistic updates** — UI updates instantly, rolls back on API error

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

The page ships with a `?runner_id=` URL param as a placeholder.
Replace the `searchParams` lookup with your app's auth:

```typescript
// Example: read runner_id from your own session cookie
import { cookies } from 'next/headers'

const cookieStore = await cookies()
const session = JSON.parse(cookieStore.get('your_session')?.value ?? '{}')
const runner_id = session.runner_id
```

The only thing `MyResultsView` needs is `runner_id`, `initialRaces`, and `athleteName`.
Everything else — components, API calls, types — is auth-agnostic.

### 4. Set the back link

Pass `backHref` to `MyResultsView` to point "Back to profile" at the right URL:

```tsx
<MyResultsView
  initialRaces={runner.race_results}
  runnerId={runner.id}
  athleteName={runner.name}
  backHref="/profile"   // ← your app's profile page
/>
```

### 5. Preview without a backend

Navigate to `/preview/my-results` — renders 15 mock races including a PB,
a hidden race, and an unconfirmed race, so you can see all card variants.

---

## Backend integration

### 1. Add the schemas

Merge `backend/app/schemas/race.py` fields (`id`, `timing_link`, `hidden`, `claimed`)
into your existing `RaceResult` schema / model.

### 2. Register the PATCH endpoint

```python
# In your existing runners router (e.g. app/api/runners.py)
from app.api.race_patch import router as race_patch_router
app.include_router(race_patch_router, prefix="/runners", tags=["runners"])
```

### 3. Backfill existing races (optional, zero-downtime)

If you have existing race records stored without `id` fields,
call `backfill_race_ids` at the top of your `GET /runners/{id}` handler:

```python
from app.services.backfill import backfill_race_ids

@router.get("/{runner_id}")
async def get_runner(runner_id: str, db=Depends(get_db)):
    runner = await service.get_runner(runner_id)
    await backfill_race_ids(runner, db)   # ← lazy migration, no-ops if all ids present
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

## Stack

- Next.js 15+ (App Router, Server Components)
- React 19
- Tailwind CSS v4
- lucide-react
- FastAPI + SQLAlchemy (async) + Pydantic v1

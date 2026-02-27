"""
PATCH /runners/{runner_id}/races/{race_id}

Plug this route into your existing FastAPI runners router.
Requires: SQLAlchemy async session, Runner model with a JSON `race_results` column.
"""
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified

from app.database import get_db          # ← your existing DB dependency
from app.schemas.race import RacePatch
from app.services.runner_service import RunnerService  # ← your existing service

router = APIRouter()


@router.patch(
    "/{runner_id}/races/{race_id}",
    response_model=Dict[str, Any],
    summary="Update mutable fields on a single race",
)
async def patch_race(
    runner_id: str,
    race_id: str,
    data: RacePatch,
    db: AsyncSession = Depends(get_db),
):
    """
    Update finish_time, timing_link, hidden, or claimed on a single race.

    race_results is a JSON column — SQLAlchemy won't detect in-place mutations,
    so we reassign the full list and call flag_modified before committing.
    """
    service = RunnerService(db)
    runner = await service.get_runner(runner_id)
    if not runner:
        raise HTTPException(status_code=404, detail="Runner not found")

    races = list(runner.race_results or [])
    race_index = next(
        (i for i, r in enumerate(races) if r.get("id") == race_id),
        None,
    )
    if race_index is None:
        raise HTTPException(status_code=404, detail="Race not found")

    # Merge only the fields that were explicitly sent
    patch_dict = data.dict(exclude_unset=True)
    races[race_index] = {**races[race_index], **patch_dict}

    # Reassign + flag so SQLAlchemy detects the change
    runner.race_results = races
    flag_modified(runner, "race_results")
    await db.commit()
    await db.refresh(runner)

    return runner.race_results[race_index]

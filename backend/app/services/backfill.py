"""
backfill_race_ids — lazy UUID migration for existing race records.

Call this at the top of GET /runners/{id} so every race has an id
before the frontend tries to PATCH it. No migration script needed.
"""
import uuid

from sqlalchemy.orm.attributes import flag_modified


async def backfill_race_ids(runner, db) -> None:
    """Assign UUIDs to any race stored without one.

    race_results is a JSON column — SQLAlchemy won't detect in-place
    mutations, so we reassign the list and call flag_modified.
    """
    races = list(runner.race_results or [])
    modified = any(not r.get("id") for r in races)
    if modified:
        for r in races:
            if not r.get("id"):
                r["id"] = str(uuid.uuid4())
        runner.race_results = races
        flag_modified(runner, "race_results")
        await db.commit()
        await db.refresh(runner)

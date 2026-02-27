import uuid
from typing import Optional

from pydantic import BaseModel, Field


class RaceResult(BaseModel):
    """Fields added to the Runner.race_results JSON column."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_name: str
    date: Optional[str] = None
    distance: Optional[str] = None
    finish_time: Optional[str] = None
    timing_link: Optional[str] = None   # URL to timing company results page
    hidden: bool = False                # athlete hid this from their public profile
    claimed: bool = True                # False = "this race might not be mine"
    category_rank: Optional[int] = None
    overall_rank: Optional[int] = None
    total_participants: Optional[int] = None
    source: str = "self_reported"
    notes: Optional[str] = None


class RacePatch(BaseModel):
    """Partial update for a single race — all fields optional."""
    finish_time: Optional[str] = None
    timing_link: Optional[str] = None
    hidden: Optional[bool] = None
    claimed: Optional[bool] = None

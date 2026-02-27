/** Race result as stored on the Runner model. */
export interface RaceResult {
  id: string;                        // UUID assigned server-side
  event_name: string;
  date: string | null;
  distance: string | null;
  finish_time: string | null;
  timing_link: string | null;        // URL to timing company results page
  hidden: boolean;                   // athlete hid this from their public profile
  claimed: boolean;                  // false = "this race might not be mine"
  category_rank: number | null;
  overall_rank: number | null;
  total_participants: number | null;
  source: string;
  notes: string | null;
}

/** Partial update sent to PATCH /runners/:id/races/:raceId */
export interface RacePatch {
  finish_time?: string | null;
  timing_link?: string | null;
  hidden?: boolean;
  claimed?: boolean;
}

/** Minimal Runner shape needed by MyResultsView — extend as needed. */
export interface Runner {
  id: string;
  name: string;
  race_results: RaceResult[];
}

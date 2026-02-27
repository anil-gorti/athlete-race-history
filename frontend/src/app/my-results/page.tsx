import { getRunner } from '@/lib/api'
import MyResultsView from '@/components/my-results/MyResultsView'

interface Props {
  searchParams: Promise<{ runner_id?: string }>
}

/**
 * /my-results?runner_id=<uuid>
 *
 * Standalone page — no Strava session required.
 *
 * Integration note for the main app:
 *   Replace the searchParams lookup below with however your app resolves
 *   the current user's runner_id (e.g. read from your own session cookie,
 *   JWT claim, database lookup by user_id, etc.).
 *
 *   The only contract this page has with the rest of the app is a runner_id
 *   string. MyResultsView, RaceCard, and patchRace are all auth-agnostic.
 */
export default async function MyResultsPage({ searchParams }: Props) {
  const { runner_id } = await searchParams

  if (!runner_id) {
    return (
      <main className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <p className="text-sm text-gray-400">
          No runner specified.{' '}
          <span className="text-gray-500 font-medium">
            Pass <code className="font-mono bg-gray-100 px-1 rounded">?runner_id=…</code> in the URL.
          </span>
        </p>
      </main>
    )
  }

  try {
    const runner = await getRunner(runner_id)
    return (
      <MyResultsView
        initialRaces={runner.race_results}
        runnerId={runner.id}
        athleteName={runner.name}
      />
    )
  } catch {
    return (
      <main className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <p className="text-sm text-red-400">
          Could not load results for this runner. Please try again.
        </p>
      </main>
    )
  }
}

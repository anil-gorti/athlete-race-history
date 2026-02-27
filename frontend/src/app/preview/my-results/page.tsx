import MyResultsView from '@/components/my-results/MyResultsView'
import type { RaceResult } from '@/lib/types'

const mockRaces: RaceResult[] = [
  { id: '1', event_name: 'Tata Mumbai Marathon', date: '2026-01-18', distance: '42.2 km', finish_time: '3:23:57', timing_link: 'https://results.tcs.com/mumbai2026', hidden: false, claimed: true, category_rank: null, overall_rank: 142, total_participants: 8900, source: 'strava', notes: null },
  { id: '2', event_name: 'DhaSh Bengaluru Half Marathon', date: '2025-12-08', distance: '21.1 km', finish_time: '1:32:57', timing_link: null, hidden: false, claimed: true, category_rank: null, overall_rank: 89, total_participants: 4200, source: 'strava', notes: null },
  { id: '3', event_name: 'Niveus Mangalore Marathon', date: '2025-11-09', distance: '21.1 km', finish_time: '1:35:13', timing_link: null, hidden: false, claimed: true, category_rank: null, overall_rank: null, total_participants: null, source: 'strava', notes: null },
  { id: '4', event_name: 'Wipro Bengaluru Marathon', date: '2025-09-21', distance: '42.2 km', finish_time: '3:26:16', timing_link: null, hidden: false, claimed: true, category_rank: null, overall_rank: null, total_participants: null, source: 'strava', notes: null },
  { id: '5', event_name: 'NMDC Hyderabad Marathon', date: '2025-08-24', distance: '42.2 km', finish_time: '3:26:41', timing_link: null, hidden: false, claimed: true, category_rank: null, overall_rank: null, total_participants: null, source: 'strava', notes: null },
  { id: '6', event_name: 'Bengaluru 10k Challenge', date: '2025-07-06', distance: '10 km', finish_time: '41:22', timing_link: 'https://bengaluru10k.in/results', hidden: false, claimed: true, category_rank: null, overall_rank: 34, total_participants: 1200, source: 'strava', notes: null },
  { id: '7', event_name: 'TCS World 10K Bengaluru', date: '2025-04-27', distance: '10 km', finish_time: '42:56', timing_link: 'https://tcsworldtenk.com/results', hidden: false, claimed: true, category_rank: 1, overall_rank: 1, total_participants: 950, source: 'strava', notes: null },
  { id: '8', event_name: 'Apollo Tyres New Delhi Marathon', date: '2025-02-23', distance: '42.2 km', finish_time: '3:11:35', timing_link: null, hidden: false, claimed: true, category_rank: null, overall_rank: 89, total_participants: 3400, source: 'strava', notes: null },
  { id: '9', event_name: 'Ooty Ultra 2025', date: '2025-03-23', distance: '60 km', finish_time: '2:11:20', timing_link: null, hidden: false, claimed: true, category_rank: null, overall_rank: null, total_participants: null, source: 'strava', notes: null },
  { id: '10', event_name: 'Adani Ahmedabad Marathon 2024', date: '2024-11-24', distance: '42.2 km', finish_time: '3:20:01', timing_link: null, hidden: false, claimed: true, category_rank: null, overall_rank: null, total_participants: null, source: 'scraped', notes: null },
  { id: '11', event_name: 'Wipro Bengaluru Marathon', date: '2024-10-06', distance: '21.1 km', finish_time: '1:31:22', timing_link: null, hidden: false, claimed: true, category_rank: null, overall_rank: 89, total_participants: 3800, source: 'strava', notes: null },
  { id: '12', event_name: 'Stonehill Founders Day Run', date: '2024-09-15', distance: '21.1 km', finish_time: '1:32:52', timing_link: null, hidden: true, claimed: true, category_rank: null, overall_rank: null, total_participants: null, source: 'strava', notes: null },
  { id: '13', event_name: 'Bengaluru Ultra 50K 2023', date: '2023-11-05', distance: '50 km', finish_time: '4:52:10', timing_link: null, hidden: false, claimed: false, category_rank: null, overall_rank: null, total_participants: null, source: 'scraped', notes: null },
  { id: '14', event_name: 'Kaveri Trail Marathon 2023', date: '2023-09-17', distance: '42.2 km', finish_time: '3:44:08', timing_link: 'https://kaveritrailmarathon.com/2023', hidden: false, claimed: true, category_rank: null, overall_rank: 201, total_participants: 620, source: 'scraped', notes: null },
  { id: '15', event_name: 'Auroville Marathon 2023', date: '2023-02-12', distance: '42.2 km', finish_time: '3:38:55', timing_link: null, hidden: false, claimed: true, category_rank: null, overall_rank: null, total_participants: null, source: 'strava', notes: null },
]

export default function PreviewMyResultsPage() {
  return (
    <MyResultsView
      initialRaces={mockRaces}
      runnerId="preview-runner-id"
      athleteName="Anil Gorti"
    />
  )
}

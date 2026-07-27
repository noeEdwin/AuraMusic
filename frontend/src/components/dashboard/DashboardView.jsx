import { FavoritesCard } from './FavoritesCard'
import { MembersCard } from './MembersCard'
import { VenueCard } from './VenueCard'
import { AppShellLayout } from '../layout/AppShellLayout'
import { SetlistPanel } from '../setlist/SetlistPanel'

export function DashboardView() {
  return (
    <AppShellLayout>
      <SetlistPanel />

      <div className="side-column">
        <VenueCard />
        <MembersCard />
        <FavoritesCard />
      </div>
    </AppShellLayout>
  )
}

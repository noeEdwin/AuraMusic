import { FavoritesCard } from './FavoritesCard'
import { MembersCard } from './MembersCard'
import { VenueCard } from './VenueCard'
import { Sidebar } from '../layout/Sidebar'
import { TopBar } from '../layout/TopBar'
import { SetlistPanel } from '../setlist/SetlistPanel'

export function DashboardView() {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-layout">
        <TopBar />

        <main className="content-grid">
          <SetlistPanel />

          <div className="side-column">
            <VenueCard />
            <MembersCard />
            <FavoritesCard />
          </div>
        </main>
      </div>
    </div>
  )
}

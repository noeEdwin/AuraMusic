import './App.css'
import { FavoritesCard } from './components/dashboard/FavoritesCard'
import { MembersCard } from './components/dashboard/MembersCard'
import { VenueCard } from './components/dashboard/VenueCard'
import { Sidebar } from './components/layout/Sidebar'
import { TopBar } from './components/layout/TopBar'
import { SetlistPanel } from './components/setlist/SetlistPanel'

function App() {
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

export default App

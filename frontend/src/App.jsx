import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'

import { LoginView } from './components/auth/LoginView'
import { ArtistsCatalogView } from './components/catalog/ArtistsCatalogView'
import { ArtistSongsView } from './components/catalog/ArtistSongsView'
import { SongsCatalogView } from './components/catalog/SongsCatalogView'
import { RegisterView } from './components/auth/RegisterView'
import { AdminView } from './components/dashboard/AdminView'
import { DashboardView } from './components/dashboard/DashboardView'
import { ProtectedRoute } from './components/routing/ProtectedRoute'
import { PublicOnlyRoute } from './components/routing/PublicOnlyRoute'
import { UnauthorizedView } from './components/shared/UnauthorizedView'
import { TeleprompterView } from './components/teleprompter/TeleprompterView'
import { SetlistsView } from './components/setlist/SetlistsView'
import { BandsView } from './components/band/BandsView'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/login"
        element={(
          <PublicOnlyRoute>
            <LoginView />
          </PublicOnlyRoute>
        )}
      />
      <Route
        path="/register"
        element={(
          <PublicOnlyRoute>
            <RegisterView />
          </PublicOnlyRoute>
        )}
      />
      <Route
        path="/dashboard"
        element={(
          <ProtectedRoute allowedRoles={['ADMIN', 'MUSICIAN', 'SOLO']}>
            <DashboardView />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/songs"
        element={(
          <ProtectedRoute allowedRoles={['ADMIN', 'MUSICIAN', 'SOLO']}>
            <SongsCatalogView />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/artists"
        element={(
          <ProtectedRoute allowedRoles={['ADMIN', 'MUSICIAN', 'SOLO']}>
            <ArtistsCatalogView />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/artists/:artistId"
        element={(
          <ProtectedRoute allowedRoles={['ADMIN', 'MUSICIAN', 'SOLO']}>
            <ArtistSongsView />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/teleprompter"
        element={(
          <ProtectedRoute allowedRoles={['ADMIN', 'MUSICIAN', 'SOLO']}>
            <TeleprompterView />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/setlists"
        element={(
          <ProtectedRoute allowedRoles={['ADMIN', 'MUSICIAN', 'SOLO']}>
            <SetlistsView />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/bands"
        element={(
          <ProtectedRoute allowedRoles={['ADMIN', 'MUSICIAN', 'SOLO']}>
            <BandsView />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/setlists/:setlistId"
        element={(
          <ProtectedRoute allowedRoles={['ADMIN', 'MUSICIAN', 'SOLO']}>
            <SetlistsView />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin"
        element={(
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminView />
          </ProtectedRoute>
        )}
      />
      <Route path="/unauthorized" element={<UnauthorizedView />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App

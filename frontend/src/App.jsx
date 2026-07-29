import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'

import { LoginView } from './components/auth/LoginView'
import { ForgotPasswordView } from './components/auth/ForgotPasswordView'
import { ResetPasswordView } from './components/auth/ResetPasswordView'
import { ArtistsCatalogView } from './components/catalog/ArtistsCatalogView'
import { ArtistSongsView } from './components/catalog/ArtistSongsView'
import { SongsCatalogView } from './components/catalog/SongsCatalogView'
import { RegisterView } from './components/auth/RegisterView'
import { AdminView } from './components/dashboard/AdminView'
import { AdminUsersView } from './components/dashboard/AdminUsersView'
import { DashboardView } from './components/dashboard/DashboardView'
import { ProtectedRoute } from './components/routing/ProtectedRoute'
import { PublicOnlyRoute } from './components/routing/PublicOnlyRoute'
import { UnauthorizedView } from './components/shared/UnauthorizedView'
import { TeleprompterView } from './components/teleprompter/TeleprompterView'
import { SetlistsView } from './components/setlist/SetlistsView'
import { BandsView } from './components/band/BandsView'
import { ProfileView } from './components/profile/ProfileView'
import { useAuth } from './auth/useAuth'

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
      <Route path="/forgot-password" element={<ForgotPasswordView />} />
      <Route path="/reset-password" element={<ResetPasswordView />} />
      <Route
        path="/dashboard"
        element={(
          <ProtectedRoute allowedRoles={['ADMIN', 'MUSICIAN', 'SOLO']}>
            <DashboardEntry />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/profile"
        element={(
          <ProtectedRoute allowedRoles={['ADMIN', 'MUSICIAN', 'SOLO']}>
            <ProfileView />
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
        path="/bands/join"
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
      <Route
        path="/admin/users"
        element={(
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminUsersView />
          </ProtectedRoute>
        )}
      />
      <Route path="/unauthorized" element={<UnauthorizedView />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App

function DashboardEntry() {
  const { role } = useAuth()

  if (role === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }

  return <DashboardView />
}

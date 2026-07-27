import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'

import { LoginView } from './components/auth/LoginView'
import { RegisterView } from './components/auth/RegisterView'
import { AdminView } from './components/dashboard/AdminView'
import { DashboardView } from './components/dashboard/DashboardView'
import { ProtectedRoute } from './components/routing/ProtectedRoute'
import { PublicOnlyRoute } from './components/routing/PublicOnlyRoute'
import { UnauthorizedView } from './components/shared/UnauthorizedView'

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

import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'

export function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation()
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (allowedRoles?.length && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

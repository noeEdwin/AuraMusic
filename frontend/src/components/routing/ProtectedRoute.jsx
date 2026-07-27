import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { LoadingScreen } from '../shared/LoadingScreen'

export function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation()
  const { isAuthenticated, isBootstrapping, role } = useAuth()

  if (isBootstrapping) {
    return <LoadingScreen message="Verificando permisos y restaurando tu sesion..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (allowedRoles?.length && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

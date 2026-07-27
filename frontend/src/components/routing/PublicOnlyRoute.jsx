import { Navigate } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { LoadingScreen } from '../shared/LoadingScreen'

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isBootstrapping, role } = useAuth()

  if (isBootstrapping) {
    return <LoadingScreen message="Restaurando tu sesion..." />
  }

  if (isAuthenticated) {
    return <Navigate to={role === 'ADMIN' ? '/admin' : '/dashboard'} replace />
  }

  return children
}

import { Navigate } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, role } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={role === 'ADMIN' ? '/admin' : '/dashboard'} replace />
  }

  return children
}

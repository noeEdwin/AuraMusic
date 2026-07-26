import './App.css'
import { LoginView } from './components/auth/LoginView'
import { RegisterView } from './components/auth/RegisterView'
import { DashboardView } from './components/dashboard/DashboardView'

function App() {
  const requestedView = new URLSearchParams(window.location.search).get('view')

  const views = {
    dashboard: <DashboardView />,
    login: <LoginView />,
    register: <RegisterView />,
  }

  return (
    views[requestedView] ?? <DashboardView />
  )
}

export default App

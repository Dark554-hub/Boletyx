import { useState } from 'react'
import './index.css'
import RoleSelector from './pages/RoleSelector'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [screen, setScreen] = useState('role') // 'role' | 'login' | 'dashboard'
  const [selectedRole, setSelectedRole] = useState(null)
  const [user, setUser] = useState(null)

  const handleRoleSelected = (role) => {
    setSelectedRole(role)
    setScreen('login')
  }

  const handleLogin = (userData) => {
    setUser(userData)
    setScreen('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setSelectedRole(null)
    setScreen('role')
  }

  const handleBack = () => {
    setScreen('role')
    setSelectedRole(null)
  }

  if (screen === 'role')      return <RoleSelector onSelect={handleRoleSelected} />
  if (screen === 'login')     return <Login role={selectedRole} onLogin={handleLogin} onBack={handleBack} />
  if (screen === 'dashboard') return <Dashboard user={user} onLogout={handleLogout} />
  return null
}

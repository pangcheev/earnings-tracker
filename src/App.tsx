import './App.css'
import { useState, useEffect } from 'react'
import { EarningsHome } from './pages/EarningsHome'
import { SessionsManagement } from './pages/SessionsManagement'
import { Navigation } from './components/Navigation'
import { Login } from './components/Login'
import { AdminPanel } from './components/AdminPanel'
import { ChangePasswordModal } from './components/ChangePasswordModal'
import { SessionData } from './types'
import { getLocalDateString } from './utils/haloPayroll'
import { supabase, loadSessionsFromCloud, deleteSessionFromCloud, syncSessionsToCloud } from './utils/supabase'
import { isCurrentUserAdmin, getCurrentUser } from './utils/auth'

function App() {
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [activeLocation] = useState<'halo'>('halo')
  const [currentPage, setCurrentPage] = useState<'earnings' | 'sessions'>('earnings')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)

  // Check if already logged in (from Supabase session)
  useEffect(() => {
    const checkAuthStatus = async () => {
      const user = await getCurrentUser()
      if (user) {
        console.log('✅ Restored auth session for:', user.email)
        setIsAuthenticated(true)
        setCurrentUserEmail(user.email)
        sessionStorage.setItem('earnings-tracker-auth', 'true')
      } else {
        console.log('ℹ️  No auth session found')
        setIsAuthenticated(false)
        setCurrentUserEmail(null)
        sessionStorage.removeItem('earnings-tracker-auth')
      }
    }
    checkAuthStatus()
  }, [])

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (isAuthenticated) {
        const admin = await isCurrentUserAdmin()
        setIsAdmin(admin)
      }
    }
    checkAdminStatus()
  }, [isAuthenticated])

  // Load data from Supabase (with localStorage fallback)
  useEffect(() => {
    const loadSessions = async () => {
      // Try to load from Supabase first
      if (supabase) {
        console.log('🔄 Attempting to load from Supabase...')
        const cloudSessions = await loadSessionsFromCloud()
        if (cloudSessions && cloudSessions.length > 0) {
          console.log('☁️  Successfully loaded', cloudSessions.length, 'sessions from cloud')
          setSessions(cloudSessions as SessionData[])
          return
        }
      }
      
      // Fallback to localStorage
      try {
        const saved = localStorage.getItem('earnings-sessions')
        if (saved) {
          const parsed = JSON.parse(saved)
          console.log('📂 Loaded sessions from localStorage:', parsed)
          setSessions(parsed)
        } else {
          console.log('💾 No saved sessions found')
        }
      } catch (error) {
        console.error('❌ Error loading from localStorage:', error)
      }
    }

    loadSessions()
  }, [])

  // Debug: Log sessions when they change
  useEffect(() => {
    if (sessions.length > 0) {
      const haloSessions = sessions.filter(s => s.location === 'halo')
      console.log(`🔍 Sessions loaded: ${sessions.length} total | Halo: ${haloSessions.length}`)
      console.log('📋 First 3 sessions:', sessions.slice(0, 3).map(s => ({ id: s.id, date: s.date })))
    }
  }, [sessions])

  // Debug: Log page changes
  useEffect(() => {
    console.log('📄 Current page:', currentPage, '| Sessions passed to page:', sessions.filter(s => s.location === 'halo').length)
  }, [currentPage, sessions])

  // Save data to localStorage (always) and Supabase (if configured)
  useEffect(() => {
    // Always save to localStorage
    try {
      localStorage.setItem('earnings-sessions', JSON.stringify(sessions))
      console.log('💾 Saved', sessions.length, 'sessions to localStorage')
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error)
    }

    // Also sync to Supabase if configured
    if (supabase && sessions.length > 0) {
      syncSessionsToCloud(sessions)
    }
  }, [sessions])

  const addSession = (session: SessionData) => {
    const newSession = { ...session, id: Date.now().toString() }
    console.log('➕ Adding new session:', newSession)
    setSessions([...sessions, newSession])
  }

  const deleteSession = (id: string) => {
    console.log('🗑️  Deleting session with id:', id)
    setSessions(sessions.filter(s => s.id !== id))
    // Delete from cloud if configured
    if (supabase) {
      deleteSessionFromCloud(id)
    }
  }

  const updateSession = (id: string, updates: Partial<SessionData>) => {
    console.log('✏️  Updating session', id, 'with:', updates)
    setSessions(sessions.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const exportSessions = () => {
    const dataStr = JSON.stringify(sessions, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `earnings-backup-${getLocalDateString()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const importSessions = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target?.result as string)
            if (Array.isArray(importedData)) {
              setSessions(importedData)
              alert('Sessions imported successfully!')
            } else {
              alert('Invalid file format')
            }
          } catch (error) {
            alert('Error reading file: ' + (error as Error).message)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleLogin = async () => {
    // Verify that we actually have a Supabase session
    const user = await getCurrentUser()
    if (user) {
      console.log('✅ Login successful, authenticated as:', user.email)
      sessionStorage.setItem('earnings-tracker-auth', 'true')
      setIsAuthenticated(true)
    } else {
      console.error('❌ Login failed - no Supabase session found')
      setIsAuthenticated(false)
    }
  }

  const handleLogout = async () => {
    // Logout from Supabase
    if (supabase) {
      await supabase.auth.signOut()
    }
    
    // Clear local storage
    sessionStorage.removeItem('earnings-tracker-auth')
    setIsAuthenticated(false)
    setIsAdmin(false)
    setCurrentPage('earnings')
    // Sessions remain in localStorage - they'll reload when user logs back in
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-stone-800 to-slate-900">
      <Navigation 
        activeLocation={activeLocation}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
        isAdmin={isAdmin}
        onAdminClick={() => setShowAdminPanel(true)}
        currentUserEmail={currentUserEmail}
        onChangePasswordClick={() => setShowChangePasswordModal(true)}
      />
      <main className="container mx-auto px-4 py-8">
        {currentPage === 'earnings' ? (
          <EarningsHome 
            sessions={sessions.filter(s => s.location === 'halo')}
            onAddSession={addSession}
            onDeleteSession={deleteSession}
            onUpdateSession={updateSession}
            currentLocation={activeLocation}
            onExportSessions={exportSessions}
            onImportSessions={importSessions}
          />
        ) : (
          <SessionsManagement
            sessions={sessions.filter(s => s.location === 'halo')}
            currentLocation={activeLocation}
            onDeleteSession={deleteSession}
            onUpdateSession={updateSession}
          />
        )}
      </main>
      {showAdminPanel && <AdminPanel onClose={() => setShowAdminPanel(false)} />}
      {showChangePasswordModal && <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />}
    </div>
  )
}

export default App

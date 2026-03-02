import { useState } from 'react'
import { SessionData } from '../types'
import { SessionTreeView } from '../components/SessionTreeView'
import { EditSessionModal } from '../components/EditSessionModal'
import { DataExportQuery } from '../components/DataExportQuery'
import { Download } from 'lucide-react'

interface SessionsManagementProps {
  sessions: SessionData[]
  currentLocation: 'halo'
  onDeleteSession: (id: string) => void
  onUpdateSession: (id: string, updates: Partial<SessionData>) => void
}

export function SessionsManagement({
  sessions,
  currentLocation,
  onDeleteSession,
  onUpdateSession,
}: SessionsManagementProps) {
  const [editingSession, setEditingSession] = useState<SessionData | null>(null)
  const [showDataQuery, setShowDataQuery] = useState(false)

  // Debug logging
  console.log('📄 SessionsManagement received:', sessions.length, 'sessions')
  if (sessions.length > 0) {
    console.log('📄 First session:', sessions[0].id, sessions[0].date, sessions[0].location)
  }

  const handleEditSession = (session: SessionData) => {
    setEditingSession(session)
  }

  const handleSaveSession = (updatedSession: SessionData) => {
    onUpdateSession(updatedSession.id, {
      date: updatedSession.date,
      services: updatedSession.services,
      addOns: updatedSession.addOns,
      tips: updatedSession.tips,
      review: updatedSession.review,
      hasClientReview: updatedSession.hasClientReview,
    })
    setEditingSession(null)
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Halo Therapies - Sessions
          </h2>
        </div>
        <button
          onClick={() => setShowDataQuery(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          title="Query and export data from Supabase"
        >
          <Download className="w-5 h-5" />
          Query & Export
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-600">
          <p className="text-slate-400 text-lg">No sessions yet</p>
          <p className="text-slate-500 text-sm mt-2">Go to Home to add your first session</p>
        </div>
      ) : (
        <SessionTreeView
          sessions={sessions}
          onEdit={handleEditSession}
          onDelete={onDeleteSession}
          isHalo={true}
        />
      )}

      {editingSession && (
        <EditSessionModal
          session={editingSession}
          isOpen={true}
          onClose={() => setEditingSession(null)}
          onSave={handleSaveSession}
          location={currentLocation}
        />
      )}

      {showDataQuery && (
        <DataExportQuery onClose={() => setShowDataQuery(false)} />
      )}
    </div>
  )
}

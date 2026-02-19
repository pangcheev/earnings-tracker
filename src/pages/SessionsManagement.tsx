import { useState } from 'react'
import { SessionData } from '../types'
import { SessionTreeView } from '../components/SessionTreeView'
import { EditSessionModal } from '../components/EditSessionModal'

interface SessionsManagementProps {
  sessions: SessionData[]
  currentLocation: 'soul-bridge' | 'halo'
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
      rating: updatedSession.rating,
      hasClientReview: updatedSession.hasClientReview,
    })
    setEditingSession(null)
  }

  const isHalo = currentLocation === 'halo'

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {currentLocation === 'soul-bridge' ? 'Soul Bridge Healing' : 'Halo Therapies'} - Sessions
        </h2>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12 bg-stone-100 rounded-lg border border-stone-700">
          <p className="text-slate-400 text-lg">No sessions yet</p>
          <p className="text-slate-500 text-sm mt-2">Go to Home to add your first session</p>
        </div>
      ) : (
        <SessionTreeView
          sessions={sessions}
          onEdit={handleEditSession}
          onDelete={onDeleteSession}
          isHalo={isHalo}
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
    </div>
  )
}

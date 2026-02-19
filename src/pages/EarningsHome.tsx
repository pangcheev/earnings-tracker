import { useState } from 'react'
import { SessionData } from '../types'
import { SessionForm } from '../components/SessionForm'
import { SessionCard } from '../components/SessionCard'
import { EarningsSummary } from '../components/EarningsSummary'
import { HaloPayrollSummary } from '../components/HaloPayrollSummary'
import { EditSessionModal } from '../components/EditSessionModal'
import { Calendar, TrendingUp, List, Download, Upload, Check, ChevronDown } from 'lucide-react'
import { calculateHaloTotalPayout, getLocalDateString, parseLocalDateString } from '../utils/haloPayroll'
import { format } from 'date-fns'

interface EarningsHomeProps {
  sessions: SessionData[]
  onAddSession: (session: SessionData) => void
  onDeleteSession: (id: string) => void
  onUpdateSession: (id: string, updates: Partial<SessionData>) => void
  currentLocation: 'soul-bridge' | 'halo'
  onExportSessions: () => void
  onImportSessions: () => void
}

export function EarningsHome({
  sessions,
  onAddSession,
  onDeleteSession,
  onUpdateSession,
  currentLocation,
  onExportSessions,
  onImportSessions,
}: EarningsHomeProps) {
  const [editingSession, setEditingSession] = useState<SessionData | null>(null)
  const [showTreeView, setShowTreeView] = useState(true)
  const [closedOutMessage, setClosedOutMessage] = useState('')
  
  // Track which date is being viewed and which dates are closed
  const getTodayOrMostRecentDate = (): string => {
    if (sessions.length === 0) {
      return getLocalDateString()
    }
    // Get the most recent session date, or today if no sessions for today
    const today = getLocalDateString()
    const hasTodaySession = sessions.some(s => s.date === today)
    if (hasTodaySession) return today
    
    const sessionDates = [...new Set(sessions.map(s => s.date))].sort().reverse()
    return sessionDates[0] || today
  }
  
  const [viewDate, setViewDate] = useState(getTodayOrMostRecentDate())
  const [closedDatesMap, setClosedDatesMap] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('earnings-closed-dates-map')
    return saved ? JSON.parse(saved) : {}
  })

  const isDateClosed = (date: string): boolean => {
    return closedDatesMap[date] === true
  }

  const toggleDateClosed = (date: string) => {
    if (isDateClosed(date)) {
      const confirmed = confirm('This day is closed. Click OK to reopen it.')
      if (!confirmed) return
      const updated = { ...closedDatesMap }
      delete updated[date]
      setClosedDatesMap(updated)
      localStorage.setItem('earnings-closed-dates-map', JSON.stringify(updated))
      setClosedOutMessage('✅ Day reopened!')
      setTimeout(() => setClosedOutMessage(''), 3000)
    } else {
      const confirmed = confirm('Close out this day? You can still add sessions for other days.')
      if (!confirmed) return
      const updated = { ...closedDatesMap, [date]: true }
      setClosedDatesMap(updated)
      localStorage.setItem('earnings-closed-dates-map', JSON.stringify(updated))
      setClosedOutMessage('✅ Day closed!')
      setTimeout(() => setClosedOutMessage(''), 3000)
    }
  }

  const changeDate = (days: number) => {
    // Parse viewDate as local time (not UTC)
    const currentDate = parseLocalDateString(viewDate)
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + days)
    setViewDate(getLocalDateString(newDate))
  }

  const handleSaveSession = (updatedSession: SessionData) => {
    onUpdateSession(editingSession!.id, {
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

  const handleAddSession = (session: SessionData) => {
    onAddSession(session)
    // If the session date differs from viewDate, auto-switch to that date
    if (session.date !== viewDate) {
      setViewDate(session.date)
    }
  }

  const handleEditSession = (session: SessionData) => {
    setEditingSession(session)
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-amber-500" />
            <h2 className="text-2xl lg:text-3xl font-bold text-white">
              {currentLocation === 'soul-bridge' ? 'Soul Bridge Healing' : 'Halo Therapies'}
            </h2>
          </div>
          
          {/* Date Navigation */}
          <div className="flex items-center gap-2 bg-slate-700 rounded-lg px-4 py-2">
            <button
              onClick={() => changeDate(-1)}
              className="text-white hover:text-amber-400 transition-colors"
              title="Previous day"
            >
              ←
            </button>
            <div className="min-w-[140px] text-center">
              <p className="text-white font-semibold">{format(parseLocalDateString(viewDate), 'EEE, MMM d')}</p>
            </div>
            <button
              onClick={() => changeDate(1)}
              className="text-white hover:text-amber-400 transition-colors"
              title="Next day"
            >
              →
            </button>
          </div>
          
          <div className="grid grid-cols-2 lg:flex gap-2 lg:gap-3">
            <button
              onClick={() => setShowTreeView(!showTreeView)}
              className={`flex items-center justify-center lg:justify-start gap-2 px-3 lg:px-4 py-2 rounded-lg font-semibold transition-colors text-sm lg:text-base ${
                showTreeView
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
              title="Show/hide sessions"
            >
              <List className="w-4 lg:w-5 h-4 lg:h-5" />
              <span className="hidden sm:inline">{showTreeView ? 'Hide' : 'Show'} Sessions</span>
            </button>
            <button
              onClick={onExportSessions}
              className="flex items-center justify-center lg:justify-start gap-2 px-3 lg:px-4 py-2 rounded-lg font-semibold bg-green-700 hover:bg-green-600 text-white transition-colors text-sm lg:text-base"
              title="Download backup"
            >
              <Download className="w-4 lg:w-5 h-4 lg:h-5" />
              <span className="hidden sm:inline">Backup</span>
            </button>
            <button
              onClick={onImportSessions}
              className="flex items-center justify-center lg:justify-start gap-2 px-3 lg:px-4 py-2 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm lg:text-base"
              title="Upload backup"
            >
              <Upload className="w-4 lg:w-5 h-4 lg:h-5" />
              <span className="hidden sm:inline">Restore</span>
            </button>
            <div className="col-span-2 lg:col-span-1">
              <SessionForm onSubmit={handleAddSession} location={currentLocation} />
            </div>
            <button
              onClick={() => toggleDateClosed(viewDate)}
              className={`flex items-center justify-center lg:justify-start gap-2 px-3 lg:px-4 py-2 rounded-lg font-semibold transition-colors text-sm lg:text-base ${
                isDateClosed(viewDate)
                  ? 'bg-blue-600 hover:bg-slate-500 text-slate-100'
                  : 'bg-green-700 hover:bg-green-600 text-white'
              }`}
              title={isDateClosed(viewDate) ? 'Click to reopen day' : 'Mark this day as complete'}
            >
              <Check className="w-4 lg:w-5 h-4 lg:h-5" />
              <span className="hidden sm:inline">{isDateClosed(viewDate) ? 'Reopen Day' : 'Close Day'}</span>
            </button>
          </div>
        </div>

        <p className="text-slate-400 text-sm">
          {currentLocation === 'soul-bridge'
            ? 'Owner - Track all sessions and earnings'
            : 'Independent Contractor - Document your sessions for contract records'}
        </p>
        {closedOutMessage && (
          <p className="text-purple-300 text-sm mt-3 font-semibold">
            {closedOutMessage}
          </p>
        )}
      </div>

      {!isDateClosed(viewDate) ? (
        <>
          {sessions.filter(s => s.date === viewDate).length > 0 && (
            <>
              {currentLocation === 'halo' ? (
                <HaloPayrollSummary sessions={sessions.filter(s => s.date === viewDate)} selectedDate={viewDate} />
              ) : (
                <EarningsSummary sessions={sessions.filter(s => s.date === viewDate)} />
              )}
            </>
          )}

          {/* Session History - Collapsible Section */}
          {sessions.filter(s => s.date === viewDate).length > 0 && (
            <div className="mb-8 bg-slate-800 rounded-lg border border-slate-600 overflow-hidden">
              {/* Collapsible Header */}
              <button
                onClick={() => setShowTreeView(!showTreeView)}
                className="w-full flex items-center justify-between p-6 hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">Session History</h3>
                  <span className="text-sm text-slate-400">({sessions.filter(s => s.date === viewDate).length})</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showTreeView ? 'rotate-180' : ''}`} />
              </button>

              {/* Collapsible Content */}
              {showTreeView && (
                <div className="border-t border-slate-600 p-6 space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-700 rounded-lg p-4 border border-amber-700">
                      <p className="text-slate-400 text-sm mb-1">Total Sessions</p>
                      <p className="text-3xl font-bold text-white">{sessions.filter(s => s.date === viewDate).length}</p>
                    </div>
                    <div className={`rounded-lg p-4 border ${currentLocation === 'halo' ? 'bg-blue-900 border-amber-700' : 'bg-amber-900 border-amber-700'}`}>
                      <p className={`text-sm mb-1 ${currentLocation === 'halo' ? 'text-blue-200' : 'text-amber-200'}`}>
                        Total {currentLocation === 'halo' ? 'Payout' : 'Earnings'}
                      </p>
                      <p className={`text-3xl font-bold ${currentLocation === 'halo' ? 'text-white' : 'text-blue-200'}`}>
                        ${sessions.filter(s => s.date === viewDate).reduce((sum, session) => {
                          if (currentLocation === 'halo') {
                            const breakdown = calculateHaloTotalPayout(session.services, session.addOns, session.tips, session.hasClientReview)
                            return sum + breakdown.total
                          } else {
                            const serviceTotal = session.services.reduce((s, srv) => s + (srv.rate / 60) * srv.duration, 0)
                            const addOnsTotal = session.addOns.reduce((a, addon) => a + addon.price, 0)
                            return sum + serviceTotal + addOnsTotal + session.tips
                          }
                        }, 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Session Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.filter(s => s.date === viewDate).map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        onDelete={onDeleteSession}
                        onEdit={handleEditSession}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {sessions.filter(s => s.date === viewDate).length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No sessions for this day</p>
              <p className="text-slate-500 text-sm mt-2">Add your first session to get started tracking earnings</p>
            </div>
          )}
        </>
      ) : (
        <div>
          <div className="text-center py-12 bg-gradient-to-b from-purple-600 to-purple-700 rounded-lg border border-emerald-300 mb-8">
            <p className="text-2xl font-bold text-white mb-3">✅ {format(parseLocalDateString(viewDate), 'EEEE, MMM d')} - Closed Out</p>
            <p className="text-slate-300 mb-2">This day's tally is locked. View history in 📋 Sessions page</p>
            <p className="text-slate-400 text-sm">You can still add sessions for other days</p>
          </div>

          {sessions.filter(s => s.date === viewDate).length > 0 && (
            <>
              {currentLocation === 'halo' ? (
                <HaloPayrollSummary sessions={sessions.filter(s => s.date === viewDate)} selectedDate={viewDate} />
              ) : (
                <>
                  <EarningsSummary sessions={sessions.filter(s => s.date === viewDate)} />
                </>
              )}
            </>
          )}
        </div>
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

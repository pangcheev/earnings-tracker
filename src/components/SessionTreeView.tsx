import { useState } from 'react'
import { SessionData } from '../types'
import { ChevronDown, ChevronRight, Edit2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { calculateHaloTotalPayout, parseLocalDateString } from '../utils/haloPayroll'

interface SessionTreeViewProps {
  sessions: SessionData[]
  onEdit: (session: SessionData) => void
  onDelete: (id: string) => void
  isHalo: boolean
}

export function SessionTreeView({ sessions, onEdit, onDelete, isHalo }: SessionTreeViewProps) {
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedSessions)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedSessions(newExpanded)
  }

  // Group sessions by date
  const sessionsByDate = sessions.reduce(
    (acc, session) => {
      const date = session.date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(session)
      return acc
    },
    {} as Record<string, SessionData[]>,
  )

  const sortedDates = Object.keys(sessionsByDate).sort().reverse()

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>No sessions recorded yet</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h3 className="text-xl font-bold text-white mb-6">📋 Session History</h3>

      <div className="space-y-4">
        {sortedDates.map(date => {
          const dayKey = date
          const daySessionList = sessionsByDate[date]
          const isExpanded = expandedSessions.has(dayKey)

          // Calculate daily total
          const dayTotal = daySessionList.reduce((sum, session) => {
            if (isHalo) {
              const breakdown = calculateHaloTotalPayout(
                session.services,
                session.addOns,
                session.tips,
                session.hasClientReview,
              )
              return sum + breakdown.total
            } else {
              const serviceTotal = session.services.reduce((s, srv) => s + (srv.rate / 60) * srv.duration, 0)
              const addOnsTotal = session.addOns.reduce((a, addon) => a + addon.price, 0)
              return sum + serviceTotal + addOnsTotal + session.tips
            }
          }, 0)

          return (
            <div key={dayKey} className={`rounded-lg border ${isExpanded ? 'border-teal-500 bg-slate-750' : 'border-slate-600 hover:border-slate-500'} transition-colors`}>
              {/* Date header */}
              <button
                onClick={() => toggleExpanded(dayKey)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-blue-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                  <div className="text-left">
                    <p className="font-semibold text-white">{format(parseLocalDateString(date), 'EEEE, MMMM d, yyyy')}</p>
                    <p className="text-xs text-slate-400">{daySessionList.length} session(s)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${isHalo ? 'text-blue-400' : 'text-amber-400'}`}>
                    ${dayTotal.toFixed(2)}
                  </p>
                </div>
              </button>

              {/* Sessions list */}
              {isExpanded && (
                <div className="border-t border-slate-600 p-4 bg-slate-900 space-y-3">
                  {daySessionList.map((session, idx) => {
                    let sessionTotal: number
                    let breakdown: any = null

                    if (isHalo) {
                      breakdown = calculateHaloTotalPayout(
                        session.services,
                        session.addOns,
                        session.tips,
                        session.hasClientReview,
                      )
                      sessionTotal = breakdown.total
                    } else {
                      const serviceTotal = session.services.reduce((s, srv) => s + (srv.rate / 60) * srv.duration, 0)
                      const addOnsTotal = session.addOns.reduce((a, addon) => a + addon.price, 0)
                      sessionTotal = serviceTotal + addOnsTotal + session.tips
                    }

                    return (
                      <div
                        key={session.id}
                        className={`p-3 rounded border ${isHalo ? 'bg-teal-950 border-teal-700 hover:border-teal-500' : 'bg-slate-800 border-slate-600 hover:border-slate-500'} transition-colors`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-slate-400">Session #{idx + 1}</span>
                              <span className="text-xs text-slate-500">• {format(parseLocalDateString(session.date), 'MMM d, yyyy')}</span>
                              {isHalo && session.hasClientReview && (
                                <span className="text-yellow-300 text-xs">📝</span>
                              )}
                            </div>
                            <p className="text-sm text-slate-300">
                              {session.services.map(s => s.type.replace(/-/g, ' ')).join(', ')}
                            </p>
                            {session.addOns.length > 0 && (
                              <p className="text-xs text-slate-400 mt-1">
                                Add-ons: {session.addOns.map(a => a.name).join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className={`font-bold text-sm ${isHalo ? 'text-teal-300' : 'text-amber-300'}`}>
                              ${sessionTotal.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Breakdown details */}
                        <div className="text-xs text-slate-400 space-y-1 mb-3 pl-3 border-l border-slate-600">
                          {isHalo ? (
                            <>
                              {breakdown.massage > 0 && <div>Massage: ${breakdown.massage.toFixed(2)}</div>}
                              {breakdown.deepTissue > 0 && <div>Deep Tissue: ${breakdown.deepTissue.toFixed(2)}</div>}
                              {breakdown.addOnsTotal > 0 && <div>Add-ons: ${breakdown.addOnsTotal.toFixed(2)}</div>}
                              {breakdown.reviewBonus > 0 && <div>Review: ${breakdown.reviewBonus.toFixed(2)}</div>}
                              {breakdown.tips > 0 && <div>Tips: ${breakdown.tips.toFixed(2)}</div>}
                            </>
                          ) : (
                            <>
                              {session.services.length > 0 && (
                                <div>
                                  Services: $
                                  {session.services.reduce((s, srv) => s + (srv.rate / 60) * srv.duration, 0).toFixed(2)}
                                </div>
                              )}
                              {session.addOns.length > 0 && (
                                <div>
                                  Add-ons: ${session.addOns.reduce((a, addon) => a + addon.price, 0).toFixed(2)}
                                </div>
                              )}
                              {session.tips > 0 && <div>Tips: ${session.tips.toFixed(2)}</div>}
                            </>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => onEdit(session)}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-semibold transition-colors ${
                              isHalo
                                ? 'bg-teal-700 hover:bg-teal-600 text-white'
                                : 'bg-slate-700 hover:bg-slate-600 text-white'
                            }`}
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this session?')) {
                                onDelete(session.id)
                              }
                            }}
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded bg-red-700 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

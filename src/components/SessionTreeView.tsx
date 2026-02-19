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
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-600">
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
            <div key={dayKey} className={`rounded-lg border ${isExpanded ? 'border-slate-400 bg-slate-750' : 'border-slate-600 hover:border-slate-400'} transition-colors`}>
              {/* Date header */}
              <button
                onClick={() => toggleExpanded(dayKey)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-300" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                  <div className="text-left">
                    <p className="font-semibold text-white">{format(parseLocalDateString(date), 'EEEE, MMMM d, yyyy')}</p>
                    <p className="text-xs text-slate-400">{daySessionList.length} session(s)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${isHalo ? 'text-green-400' : 'text-amber-400'}`}>
                    ${dayTotal.toFixed(2)}
                  </p>
                </div>
              </button>

              {/* Sessions list */}
              {isExpanded && (
                <div className="border-t border-slate-700 p-4 bg-slate-900 space-y-3">
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
                        className={`p-3 rounded border bg-white border-gray-300 hover:border-gray-400 transition-colors`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-slate-800">Session #{idx + 1}</span>
                              <span className="text-xs text-slate-600">• {format(parseLocalDateString(session.date), 'MMM d, yyyy')}</span>
                              {isHalo && session.hasClientReview && (
                                <span className="text-yellow-600 text-xs">📝</span>
                              )}
                            </div>
                            <p className="text-sm text-slate-800">
                              {session.services.map(s => s.type.replace(/-/g, ' ')).join(', ')}
                            </p>
                            {session.addOns.length > 0 && (
                              <p className="text-xs text-slate-700 mt-1">
                                Add-ons: {session.addOns.map(a => a.name).join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className={`font-bold text-sm ${isHalo ? 'text-blue-700' : 'text-blue-700'}`}>
                              ${sessionTotal.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Breakdown details */}
                        <div className="text-xs space-y-1 mb-3 pl-3 border-l text-slate-700 border-slate-400">
                          {isHalo ? (
                            <>
                              {/* Show services with their surcharges included */}
                              {session.services.map((service) => {
                                let serviceAmount = service.haloBasePrice || service.rate
                                // Add service-type surcharge to service display
                                if (service.type === 'deep-tissue') {
                                  serviceAmount += 7.50
                                } else if (service.type === 'advanced-bodywork') {
                                  serviceAmount += 12.50
                                }
                                return (
                                  <div key={service.id}>
                                    <span className="capitalize">{service.type.replace(/-/g, ' ')}</span>: ${serviceAmount.toFixed(2)}
                                  </div>
                                )
                              })}
                              
                              {/* Show all add-ons (including service-type add-ons if they were added as add-ons) */}
                              {session.addOns.map((addon) => (
                                <div key={addon.id}>
                                  {addon.name}: ${addon.price.toFixed(2)}
                                </div>
                              ))}
                              
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
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-semibold transition-colors bg-blue-600 hover:bg-blue-700 text-white"
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

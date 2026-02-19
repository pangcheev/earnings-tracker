import { SessionData } from '../types'
import { useMemo } from 'react'

interface EarningsSummaryProps {
  sessions: SessionData[]
}

export function EarningsSummary({ sessions }: EarningsSummaryProps) {
  const stats = useMemo(() => {
    const totalEarnings = sessions.reduce((acc, session) => {
      const services = session.services.reduce((s, srv) => s + (srv.rate / 60) * srv.duration, 0)
      const addOns = session.addOns.reduce((a, addon) => a + addon.price, 0)
      return acc + services + addOns + session.tips
    }, 0)

    const totalTips = sessions.reduce((acc, s) => acc + s.tips, 0)
    const totalServices = sessions.reduce((acc, session) => {
      return acc + session.services.reduce((s, srv) => s + (srv.rate / 60) * srv.duration, 0)
    }, 0)
    const totalAddOns = sessions.reduce((acc, session) => {
      return acc + session.addOns.reduce((a, addon) => a + addon.price, 0)
    }, 0)

    const averagePerSession = sessions.length > 0 ? totalEarnings / sessions.length : 0

    return {
      sessionCount: sessions.length,
      totalEarnings,
      totalTips,
      totalServices,
      totalAddOns,
      averagePerSession,
    }
  }, [sessions])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg p-6">
        <p className="text-white text-sm font-semibold mb-2">Total Earnings</p>
        <p className="text-3xl font-bold text-white">${stats.totalEarnings.toFixed(2)}</p>
        <p className="text-xs text-amber-100 mt-2">{stats.sessionCount} sessions</p>
      </div>

      <div className="bg-gradient-to-br from-amber-700 to-stone-700 rounded-lg p-6">
        <p className="text-slate-100 text-sm font-semibold mb-2">Services + Add-ons</p>
        <p className="text-3xl font-bold text-white">${(stats.totalServices + stats.totalAddOns).toFixed(2)}</p>
        <p className="text-xs text-white mt-2">Services: ${stats.totalServices.toFixed(2)}</p>
      </div>

      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg p-6">
        <p className="text-white text-sm font-semibold mb-2">Tips</p>
        <p className="text-3xl font-bold text-white">${stats.totalTips.toFixed(2)}</p>
        <p className="text-xs text-green-100 mt-2">Avg: ${stats.averagePerSession.toFixed(2)}/session</p>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Download, Filter, X } from 'lucide-react'
import { querySessionsFromCloud, exportToCsv, exportToJson } from '../utils/dataQuery'
import { SessionData } from '../types'
import { format } from 'date-fns'
import { isCurrentUserAdmin, getAllUsers, UserProfile } from '../utils/auth'

interface DataExportQueryProps {
  onClose: () => void
}

export function DataExportQuery({ onClose }: DataExportQueryProps) {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SessionData[]>([])
  const [showResults, setShowResults] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('')

  // Filter state
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [location, setLocation] = useState<'all' | 'soul-bridge' | 'halo'>('all')
  const [serviceType, setServiceType] = useState<'all' | 'massage' | 'deep-tissue' | 'advanced-bodywork'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'earnings' | 'duration'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Load admin status and users on component mount
  useEffect(() => {
    const loadAdminStatus = async () => {
      try {
        const adminStatus = await isCurrentUserAdmin()
        setIsAdmin(adminStatus)

        if (adminStatus) {
          const allUsers = await getAllUsers()
          if (allUsers) {
            setUsers(allUsers)
          }
        }
      } catch (error) {
        console.error('Failed to load admin status:', error)
      }
    }

    loadAdminStatus()
  }, [])

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const queriedSessions = await querySessionsFromCloud(
        {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          location,
          serviceType,
          sortBy,
          sortOrder,
        },
        isAdmin && selectedUserId ? selectedUserId : undefined
      )

      setResults(queriedSessions)
      setShowResults(true)
    } catch (error) {
      console.error('Query error:', error)
      alert('Failed to query sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = (exportFmt: 'csv' | 'json') => {
    if (results.length === 0) {
      alert('No results to export')
      return
    }

    const dateRange = startDate && endDate
      ? `${startDate}_to_${endDate}`
      : startDate
      ? `from_${startDate}`
      : endDate
      ? `until_${endDate}`
      : 'all'

    const filename = `sessions-${dateRange}-${format(new Date(), 'yyyy-MM-dd')}.${exportFmt}`

    if (exportFmt === 'csv') {
      exportToCsv(results, filename)
    } else {
      exportToJson(results, filename)
    }
  }

  // Calculate statistics
  const totalSessions = results.length
  const totalEarnings = results.reduce((sum, session) => {
    const basePrice = session.services[0]?.rate || 0
    const addOnsTotal = session.addOns.reduce((s, addon) => s + addon.price, 0)
    return sum + basePrice + addOnsTotal + session.tips
  }, 0)
  const totalTips = results.reduce((sum, session) => sum + session.tips, 0)
  const totalDuration = results.reduce((sum, session) => sum + (session.services[0]?.duration || 0), 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Filter className="w-6 h-6" />
            Query & Export Sessions
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleQuery} className="space-y-6">
          {/* Admin User Selection */}
          {isAdmin && users.length > 0 && (
            <div className="bg-purple-700 bg-opacity-50 p-4 rounded-lg border border-purple-500">
              <label className="block text-sm font-semibold text-white mb-2">Select User (Admin Only)</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
              >
                <option value="">My Data (Current User)</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName || user.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filters Section */}
          <div className="bg-slate-700 p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Location</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value as any)}
                  className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                >
                  <option value="all">All Locations</option>
                  <option value="soul-bridge">Soul Bridge Healing</option>
                  <option value="halo">Halo Therapies</option>
                </select>
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Service Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as any)}
                  className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                >
                  <option value="all">All Services</option>
                  <option value="massage">Massage</option>
                  <option value="deep-tissue">Deep Tissue</option>
                  <option value="advanced-bodywork">Advanced Bodywork</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                >
                  <option value="date">Date</option>
                  <option value="earnings">Earnings</option>
                  <option value="duration">Duration</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Sort Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>

            {/* Query Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors mt-4"
            >
              {loading ? 'Querying...' : 'Query Sessions'}
            </button>
          </div>

          {/* Results Section */}
          {showResults && (
            <div className="bg-slate-700 p-6 rounded-lg space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Results ({totalSessions} sessions)</h3>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-600 p-4 rounded">
                  <p className="text-slate-300 text-sm">Total Sessions</p>
                  <p className="text-2xl font-bold text-blue-400">{totalSessions}</p>
                </div>
                <div className="bg-slate-600 p-4 rounded">
                  <p className="text-slate-300 text-sm">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-400">${totalEarnings.toFixed(2)}</p>
                </div>
                <div className="bg-slate-600 p-4 rounded">
                  <p className="text-slate-300 text-sm">Total Tips</p>
                  <p className="text-2xl font-bold text-amber-400">${totalTips.toFixed(2)}</p>
                </div>
                <div className="bg-slate-600 p-4 rounded">
                  <p className="text-slate-300 text-sm">Total Hours</p>
                  <p className="text-2xl font-bold text-purple-400">{(totalDuration / 60).toFixed(1)}</p>
                </div>
              </div>

              {/* Sessions Table */}
              {results.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-slate-300">
                    <thead className="bg-slate-600 text-white">
                      <tr>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Location</th>
                        <th className="px-4 py-2 text-left">Service</th>
                        <th className="px-4 py-2 text-center">Duration</th>
                        <th className="px-4 py-2 text-right">Earnings</th>
                        <th className="px-4 py-2 text-right">Tips</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((session) => {
                        const firstService = session.services[0]
                        const basePrice = firstService?.rate || 0
                        const addOnsTotal = session.addOns.reduce((sum, addon) => sum + addon.price, 0)
                        const earnings = basePrice + addOnsTotal

                        return (
                          <tr key={session.id} className="border-t border-slate-600 hover:bg-slate-600">
                            <td className="px-4 py-2">{session.date}</td>
                            <td className="px-4 py-2">
                              {session.location === 'halo' ? 'Halo' : 'Soul Bridge'}
                            </td>
                            <td className="px-4 py-2">{firstService?.type || 'Unknown'}</td>
                            <td className="px-4 py-2 text-center">{firstService?.duration || 0}m</td>
                            <td className="px-4 py-2 text-right font-semibold text-green-400">
                              ${earnings.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-right text-amber-400">
                              ${session.tips.toFixed(2)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {results.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-400">No sessions found matching your filters</p>
                </div>
              )}

              {/* Export Options */}
              {results.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-600 space-y-3">
                  <label className="block text-sm font-semibold text-white mb-3">Export Format</label>
                  <div className="flex gap-2 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="csv"
                        checked={exportFormat === 'csv'}
                        onChange={(e) => setExportFormat(e.target.value as any)}
                        className="w-4 h-4"
                      />
                      <span className="text-white">CSV (Excel)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="json"
                        checked={exportFormat === 'json'}
                        onChange={(e) => setExportFormat(e.target.value as any)}
                        className="w-4 h-4"
                      />
                      <span className="text-white">JSON</span>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExport(exportFormat)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Export {results.length} Sessions as {exportFormat.toUpperCase()}
                  </button>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors mt-6"
        >
          Close
        </button>
      </div>
    </div>
  )
}

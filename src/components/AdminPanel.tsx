import { useState, useEffect } from 'react'
import { X, Shield, ShieldOff, CheckCircle, XCircle } from 'lucide-react'
import { getAllUsers, makeUserAdmin, removeUserAdmin, toggleUserActive, UserProfile } from '../utils/auth'

interface AdminPanelProps {
  onClose: () => void
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const allUsers = await getAllUsers()
    if (allUsers) {
      setUsers(allUsers)
    }
    setLoading(false)
  }

  const handleToggleAdmin = async (userId: string, isCurrentlyAdmin: boolean) => {
    const success = isCurrentlyAdmin
      ? await removeUserAdmin(userId)
      : await makeUserAdmin(userId)

    if (success) {
      setMessage(`✅ ${isCurrentlyAdmin ? 'Removed' : 'Added'} admin role`)
      loadUsers()
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage('❌ Failed to update admin status')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleToggleActive = async (userId: string, isCurrentlyActive: boolean) => {
    const success = await toggleUserActive(userId, !isCurrentlyActive)

    if (success) {
      setMessage(`✅ User ${isCurrentlyActive ? 'disabled' : 'enabled'}`)
      loadUsers()
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage('❌ Failed to update user status')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-400" />
            Admin Panel
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-slate-700 text-white rounded-lg">
            {message}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-slate-400">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-300">
              <thead className="bg-slate-700 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Full Name</th>
                  <th className="px-4 py-3 text-center">Admin</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-600 hover:bg-slate-700">
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.fullName || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      {user.isAdmin ? (
                        <Shield className="w-5 h-5 text-purple-400 inline" />
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.isActive ? (
                        <CheckCircle className="w-5 h-5 text-green-400 inline" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 inline" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                          className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                            user.isAdmin
                              ? 'bg-purple-700 hover:bg-purple-600 text-white'
                              : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
                          }`}
                          title={user.isAdmin ? 'Remove admin' : 'Make admin'}
                        >
                          {user.isAdmin ? (
                            <ShieldOff className="w-4 h-4" />
                          ) : (
                            <Shield className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleToggleActive(user.id, user.isActive)}
                          className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                            user.isActive
                              ? 'bg-green-700 hover:bg-green-600 text-white'
                              : 'bg-red-700 hover:bg-red-600 text-white'
                          }`}
                          title={user.isActive ? 'Disable user' : 'Enable user'}
                        >
                          {user.isActive ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-600 bg-slate-700 p-4 rounded">
          <h3 className="font-semibold text-white mb-2">Admin Features</h3>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>✅ View all users and their activity</li>
            <li>✅ Assign/remove admin privileges</li>
            <li>✅ Enable/disable user accounts</li>
            <li>✅ View all users' session data</li>
            <li>✅ Manage user profiles</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}

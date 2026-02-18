import { useState } from 'react'
import { Lock } from 'lucide-react'

interface LoginProps {
  onLogin: () => void
}

export function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simple password check - you can change this password as needed
    const correctPassword = 'earnings2026'
    
    if (password === correctPassword) {
      setError('')
      onLogin()
    } else {
      setError('Incorrect password')
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="bg-amber-500 p-4 rounded-full">
              <Lock className="w-8 h-8 text-slate-900" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-2">Earnings Tracker</h1>
          <p className="text-slate-400 text-center text-sm mb-8">Secure Access</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => {
                  setError('')
                  e.target.select()
                }}
                placeholder="Enter password"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 rounded-lg transition-colors"
            >
              Unlock
            </button>
          </form>

          <p className="text-slate-500 text-xs text-center mt-6">
            🔒 Your earnings data is private and protected
          </p>
        </div>
      </div>
    </div>
  )
}

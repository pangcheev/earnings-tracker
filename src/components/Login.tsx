import { useState } from 'react'
import { Lock, Mail } from 'lucide-react'
import { signupUser, loginUser } from '../utils/auth'

interface LoginProps {
  onLogin: () => void
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isSignup) {
        // Sign up mode
        if (!email || !password) {
          setError('Please enter both email and password')
          setIsLoading(false)
          return
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters')
          setIsLoading(false)
          return
        }
        
        await signupUser(email, password)
        setError('')
        onLogin()
      } else {
        // Login mode
        if (!email || !password) {
          setError('Please enter both email and password')
          setIsLoading(false)
          return
        }
        
        await loginUser(email, password)
        setError('')
        onLogin()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      setError(errorMessage)
      setPassword('')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-stone-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-600 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="bg-yellow-500 p-4 rounded-full">
              <Lock className="w-8 h-8 text-slate-900" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-2">Earnings Tracker</h1>
          <p className="text-slate-400 text-center text-sm mb-8">
            {isSignup ? 'Create your account' : 'Secure Access'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setError('')}
                placeholder="your@email.com"
                className="w-full bg-slate-700 border border-amber-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
                autoFocus
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setError('')}
                placeholder={isSignup ? 'At least 6 characters' : 'Enter password'}
                className="w-full bg-slate-700 border border-amber-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-600 disabled:opacity-50 text-slate-900 font-bold py-3 rounded-lg transition-colors"
            >
              {isLoading ? 'Processing...' : isSignup ? 'Sign Up' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup)
                  setError('')
                  setEmail('')
                  setPassword('')
                }}
                disabled={isLoading}
                className="ml-2 text-yellow-500 hover:text-yellow-400 font-semibold disabled:opacity-50"
              >
                {isSignup ? 'Login' : 'Sign Up'}
              </button>
            </p>
          </div>

          <p className="text-slate-500 text-xs text-center mt-6">
            🔒 Your earnings data is private and protected
          </p>
        </div>
      </div>
    </div>
  )
}

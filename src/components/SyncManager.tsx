import { useState } from 'react'
import { Upload, Download, Wifi, AlertCircle, CheckCircle2 } from 'lucide-react'
import { SessionData } from '../types'

interface SyncManagerProps {
  sessions: SessionData[]
  onUpdateSessions: (sessions: SessionData[]) => void
}

export function SyncManager({ sessions, onUpdateSessions }: SyncManagerProps) {
  const [syncUrl, setSyncUrl] = useState('http://192.168.0.158:3001')
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'downloading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [syncedCount, setSyncedCount] = useState(0)

  const handleUpload = async () => {
    setStatus('uploading')
    setMessage('Uploading sessions...')
    
    try {
      const response = await fetch(`${syncUrl}/sync-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions }),
      })

      if (!response.ok) throw new Error('Upload failed')
      
      const data = await response.json()
      setStatus('success')
      setMessage(`✅ ${data.message}`)
      setSyncedCount(sessions.length)
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      setStatus('error')
      setMessage(`❌ Sync failed: ${(err as Error).message}`)
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const handleDownload = async () => {
    setStatus('downloading')
    setMessage('Downloading sessions...')
    
    try {
      const response = await fetch(`${syncUrl}/sync-download`)
      if (!response.ok) throw new Error('Download failed')
      
      const data = await response.json()
      const remoteSessions = data.sessions

      if (remoteSessions.length === 0) {
        setStatus('error')
        setMessage('❌ No sessions on server')
        setTimeout(() => setStatus('idle'), 3000)
        return
      }

      // Merge strategy: keep local + add remote (avoid duplicates by ID)
      const localIds = new Set(sessions.map(s => s.id))
      const newSessions = remoteSessions.filter((s: SessionData) => !localIds.has(s.id))
      const merged = [...sessions, ...newSessions]

      onUpdateSessions(merged)
      setStatus('success')
      setMessage(`✅ Synced! Added ${newSessions.length} new sessions`)
      setSyncedCount(merged.length)
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      setStatus('error')
      setMessage(`❌ Sync failed: ${(err as Error).message}`)
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <>
      {/* Floating Sync Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-full shadow-lg transition-all hover:shadow-xl z-40"
        title="WiFi Sync"
      >
        <Wifi className="w-5 h-5" />
        <span className="hidden sm:inline">Sync</span>
      </button>

      {/* Sync Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-800 rounded-lg p-6 max-w-md w-full border border-stone-700">
            <div className="flex items-center gap-2 mb-4">
              <Wifi className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">WiFi Sync</h2>
            </div>

            {/* Server URL Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-white mb-2">
                Sync Server URL
              </label>
              <input
                type="text"
                value={syncUrl}
                onChange={(e) => setSyncUrl(e.target.value)}
                className="w-full bg-stone-700 border border-amber-700 rounded px-3 py-2 text-white text-sm"
                placeholder="http://192.168.0.158:3001"
              />
              <p className="text-xs text-slate-400 mt-1">
                Make sure sync-server is running: <code>node sync-server.js</code>
              </p>
            </div>

            {/* Status Message */}
            {status !== 'idle' && (
              <div
                className={`mb-4 p-3 rounded flex items-start gap-2 ${
                  status === 'success'
                    ? 'bg-green-900 border border-green-700'
                    : status === 'error'
                    ? 'bg-red-900 border border-red-700'
                    : 'bg-blue-900 border border-teal-700'
                }`}
              >
                {status === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                ) : status === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
                ) : (
                  <div className="w-5 h-5 border-2 border-blue-300 border-t-transparent rounded-full animate-spin flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm text-white">{message}</p>
              </div>
            )}

            {/* Stats */}
            {syncedCount > 0 && status === 'success' && (
              <div className="mb-4 p-3 bg-stone-700 rounded border border-amber-700">
                <p className="text-sm text-slate-300">
                  Total sessions: <span className="font-bold text-white">{syncedCount}</span>
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleUpload}
                disabled={status !== 'idle'}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-amber-700 text-white px-4 py-2 rounded font-semibold transition-colors"
              >
                <Upload className="w-5 h-5" />
                Upload (Push from here)
              </button>

              <button
                onClick={handleDownload}
                disabled={status !== 'idle'}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-amber-700 text-white px-4 py-2 rounded font-semibold transition-colors"
              >
                <Download className="w-5 h-5" />
                Download (Pull from server)
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-stone-700 hover:bg-amber-700 text-white px-4 py-2 rounded font-semibold transition-colors"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-4 text-center">
              💡 Upload from phone → Download on desktop (or vice versa)
            </p>
          </div>
        </div>
      )}
    </>
  )
}

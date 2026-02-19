import { Building2, Home, LogOut } from 'lucide-react'

interface NavigationProps {
  activeLocation: 'soul-bridge' | 'halo'
  setActiveLocation: (location: 'soul-bridge' | 'halo') => void
  currentPage: 'earnings' | 'sessions'
  onPageChange: (page: 'earnings' | 'sessions') => void
  onLogout: () => void
}

export function Navigation({ activeLocation, setActiveLocation, currentPage, onPageChange, onLogout }: NavigationProps) {
  return (
    <nav className="bg-slate-950 border-b border-stone-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-amber-500" />
            <h1 className="text-2xl font-bold text-white">Earnings Tracker</h1>
          </div>
          <p className="text-slate-400 text-sm">Daily Earnings & Tax Tracking</p>
        </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onPageChange('earnings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              currentPage === 'earnings'
                ? 'bg-green-600 text-white'
                : 'bg-stone-800 text-white hover:bg-stone-700'
            }`}
          >
            <Home className="w-5 h-5" />
            Home
          </button>
          <button
            onClick={() => onPageChange('sessions')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              currentPage === 'sessions'
                ? 'bg-purple-600 text-white'
                : 'bg-stone-800 text-white hover:bg-stone-700'
            }`}
          >
            📋 Sessions
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveLocation('soul-bridge')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeLocation === 'soul-bridge'
                ? 'bg-amber-500 text-white'
                : 'bg-stone-800 text-white hover:bg-stone-700'
            }`}
          >
            Soul Bridge Healing
          </button>
          <button
            onClick={() => setActiveLocation('halo')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeLocation === 'halo'
                ? 'bg-blue-500 text-white'
                : 'bg-stone-800 text-white hover:bg-stone-700'
            }`}
          >
            Halo Therapies
          </button>
        </div>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-red-700 hover:bg-red-600 text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
      </div>
    </nav>
  )
}

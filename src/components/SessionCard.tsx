import { SessionData } from '../types'
import { format } from 'date-fns'
import { Trash2, Edit2 } from 'lucide-react'
import { calculateHaloTotalPayout, parseLocalDateString } from '../utils/haloPayroll'

interface SessionCardProps {
  session: SessionData
  onDelete: (id: string) => void
  onEdit?: (session: SessionData) => void
}

export function SessionCard({ session, onDelete, onEdit }: SessionCardProps) {
  const isHalo = session.location === 'halo'
  
  let totalServices: number
  let totalAddOns: number
  let grandTotal: number
  let reviewBonus: number

  if (isHalo) {
    const breakdown = calculateHaloTotalPayout(
      session.services,
      session.addOns,
      session.tips,
      session.hasClientReview,
    )
    totalServices = breakdown.massage + breakdown.deepTissue + breakdown.advancedBodywork
    totalAddOns = breakdown.addOnsTotal
    grandTotal = breakdown.total
    reviewBonus = breakdown.reviewBonus
  } else {
    totalServices = session.services.reduce((acc, s) => acc + (s.rate / 60) * s.duration, 0)
    totalAddOns = session.addOns.reduce((acc, a) => acc + a.price, 0)
    grandTotal = totalServices + totalAddOns + session.tips
    reviewBonus = 0
  }

  return (
    <div className={`rounded-lg p-6 hover:shadow-lg transition-all ${isHalo ? 'bg-gray-400 hover:bg-gray-500' : 'bg-slate-700 hover:bg-slate-600'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {format(parseLocalDateString(session.date), 'MMMM d, yyyy')}
          </h3>
          <p className="text-xs mt-1 text-slate-800">Halo Therapies</p>
          {session.hasClientReview && (
            <div className="text-yellow-600 text-sm mt-2 font-semibold">📝 Client Review</div>
          )}
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(session)}
              className={`transition-colors ${isHalo ? 'text-green-700 hover:text-green-800' : 'text-amber-400 hover:text-amber-300'}`}
            >
              <Edit2 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => onDelete(session.id)}
            className={`transition-colors ${isHalo ? 'text-red-600 hover:text-red-700' : 'text-red-400 hover:text-red-300'}`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Services */}
      <div className="mb-4">
        <h4 className={`text-sm font-semibold mb-2 ${isHalo ? 'text-slate-900' : 'text-white'}`}>Services</h4>
        <div className="space-y-1">
          {session.services.map((service) => {
            let earnings = isHalo ? (service.haloBasePrice || service.rate) : (service.rate / 60) * service.duration
            
            // For Halo services, add service-type surcharge only if there's NO matching add-on
            if (isHalo) {
              // Check if there's a matching add-on for this surcharge type
              const hasMatchingAddOn = session.addOns.some((addon) => {
                const checkId = (addon as any).haloCode || addon.id
                if (service.type === 'deep-tissue' && checkId === 'deep-tissue') return true
                if (service.type === 'advanced-bodywork' && checkId === 'advanced-bodywork') return true
                return false
              })
              
              // Only add surcharge to service if there's no matching add-on
              if (!hasMatchingAddOn) {
                if (service.type === 'deep-tissue') {
                  earnings += 7.50
                } else if (service.type === 'advanced-bodywork') {
                  earnings += 12.50
                }
              }
            }
            
            return (
              <div key={service.id} className={`text-sm ${isHalo ? 'text-slate-900' : 'text-white'}`}>
                <span className="capitalize">{service.type.replace(/-/g, ' ')}</span> ({service.duration}min) - <span className="font-semibold">${earnings.toFixed(2)}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add-ons */}
      {session.addOns.length > 0 && (
        <div className="mb-4">
          <h4 className={`text-sm font-semibold mb-2 ${isHalo ? 'text-slate-900' : 'text-white'}`}>Add-ons</h4>
          <div className="space-y-1">
            {session.addOns.map((addon) => (
              <div key={addon.id} className={`text-sm ${isHalo ? 'text-slate-900' : 'text-white'}`}>
                {addon.name} - <span className="font-semibold">${addon.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review */}
      {!isHalo && session.review && (
        <div className="mb-4 bg-opacity-50 p-3 rounded">
          <p className="text-sm italic opacity-90">"{session.review}"</p>
        </div>
      )}

      {/* Total */}
      <div className={`border-t pt-4 mt-4 flex justify-between items-center ${isHalo ? 'border-gray-500' : 'border-amber-700'}`}>
        <span className={`${isHalo ? 'text-slate-900' : 'text-white'}`}>{isHalo ? 'Total Payout' : 'Total Earnings'}:</span>
        <span className={`text-xl font-bold ${isHalo ? 'text-green-700' : 'text-amber-400'}`}>
          ${grandTotal.toFixed(2)}
        </span>
      </div>

      {/* Breakdown */}
      <div className="text-xs mt-3 space-y-1 opacity-75">
        {isHalo && session.services.length > 0 && (
          <div className="flex justify-between">
            <span>Services:</span>
            <span>${totalServices.toFixed(2)}</span>
          </div>
        )}
        {totalAddOns > 0 && (
          <div className="flex justify-between">
            <span>Add-ons:</span>
            <span>${totalAddOns.toFixed(2)}</span>
          </div>
        )}
        {reviewBonus > 0 && (
          <div className="flex justify-between text-yellow-300">
            <span>Review Bonus:</span>
            <span>${reviewBonus.toFixed(2)}</span>
          </div>
        )}
        {session.tips > 0 && (
          <div className="flex justify-between">
            <span>{isHalo ? 'Tips (100%)' : 'Tips'}:</span>
            <span>${session.tips.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

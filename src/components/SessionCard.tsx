import { SessionData } from '../types'
import { format } from 'date-fns'
import { Trash2, Star, Edit2 } from 'lucide-react'
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
    totalServices = breakdown.massage + breakdown.deepTissue
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
    <div className={`rounded-lg p-6 hover:shadow-lg transition-all ${isHalo ? 'bg-teal-700 hover:bg-teal-600' : 'bg-stone-700 hover:bg-amber-700'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {format(parseLocalDateString(session.date), 'MMMM d, yyyy')}
          </h3>
          <p className="text-xs mt-1 opacity-75">
            {isHalo ? 'Halo Therapies' : 'Soul Bridge Healing'}
          </p>
          {!isHalo && session.rating && (
            <div className="flex items-center gap-1 mt-2">
              {[...Array(session.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          )}
          {isHalo && session.hasClientReview && (
            <div className="text-yellow-300 text-sm mt-2 font-semibold">📝 Client Review</div>
          )}
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(session)}
              className={`transition-colors ${isHalo ? 'text-teal-700 hover:text-teal-100' : 'text-amber-400 hover:text-amber-300'}`}
            >
              <Edit2 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => onDelete(session.id)}
            className={`transition-colors ${isHalo ? 'text-red-300 hover:text-red-200' : 'text-red-400 hover:text-red-300'}`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Services */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold opacity-90 mb-2">Services</h4>
        <div className="space-y-1">
          {session.services.map((service) => {
            const earnings = isHalo ? (service.haloBasePrice || service.rate) : (service.rate / 60) * service.duration
            return (
              <div key={service.id} className="text-sm opacity-85">
                <span className="capitalize">{service.type.replace(/-/g, ' ')}</span> ({service.duration}min) - <span className="font-semibold">${earnings.toFixed(2)}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add-ons */}
      {session.addOns.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold opacity-90 mb-2">Add-ons</h4>
          <div className="space-y-1">
            {session.addOns.map((addon) => (
              <div key={addon.id} className="text-sm opacity-85">
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
      <div className={`border-t pt-4 mt-4 flex justify-between items-center ${isHalo ? 'border-blue-600' : 'border-amber-700'}`}>
        <span className="opacity-90">{isHalo ? 'Total Payout' : 'Total Earnings'}:</span>
        <span className={`text-xl font-bold ${isHalo ? 'text-yellow-300' : 'text-amber-400'}`}>
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

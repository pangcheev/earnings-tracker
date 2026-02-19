import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { SessionData, ServiceEntry, AddOn } from '../types'
import { HALO_ADDONS, calculateHaloServicePayout } from '../utils/haloPayroll'

interface EditSessionModalProps {
  session: SessionData | null
  isOpen: boolean
  onClose: () => void
  onSave: (session: SessionData) => void
  location: 'soul-bridge' | 'halo'
}

export function EditSessionModal({ session, isOpen, onClose, onSave, location }: EditSessionModalProps) {
  const [date, setDate] = useState('')
  const [services, setServices] = useState<ServiceEntry[]>([])
  const [addOns, setAddOns] = useState<AddOn[]>([])
  const [tips, setTips] = useState(0)
  const [review, setReview] = useState('')
  const [rating, setRating] = useState(5)
  const [hasClientReview, setHasClientReview] = useState(false)

  const [serviceType, setServiceType] = useState<'massage' | 'deep-tissue'>('massage')
  const [duration, setDuration] = useState(60)
  const [rate, setRate] = useState(75)

  const [haloServiceType, setHaloServiceType] = useState<'massage' | 'deep-tissue' | 'advanced-bodywork'>('massage')
  const [haloDuration, setHaloDuration] = useState(60)
  const [selectedHaloAddOns, setSelectedHaloAddOns] = useState<string[]>([])

  const isHalo = location === 'halo'

  useEffect(() => {
    if (session && isOpen) {
      setDate(session.date)
      setServices([...session.services])
      setAddOns([...session.addOns])
      setTips(session.tips)
      setReview(session.review || '')
      setRating(session.rating || 5)
      setHasClientReview(session.hasClientReview || false)
    }
  }, [session, isOpen])

  const handleAddService = () => {
    if (isHalo) {
      const payout = calculateHaloServicePayout(haloServiceType, haloDuration)
      setServices([
        ...services,
        {
          id: `edit-${Date.now()}`,
          type: haloServiceType as 'massage' | 'deep-tissue' | 'advanced-bodywork',
          duration: haloDuration,
          rate: payout,
          haloBasePrice: payout,
        },
      ])
    } else {
      setServices([
        ...services,
        {
          id: `edit-${Date.now()}`,
          type: serviceType,
          duration,
          rate,
        },
      ])
    }
  }

  const handleAddAddOns = () => {
    if (isHalo) {
      const newAddOns = selectedHaloAddOns
        .map(id => HALO_ADDONS.find(addon => addon.id === id))
        .filter(Boolean)
        .map(addon => ({
          id: `${addon!.id}-${Date.now()}`,
          name: addon!.name,
          price: addon!.price,
          haloCode: addon!.id,
        }))

      setAddOns([...addOns, ...newAddOns])
      setSelectedHaloAddOns([])
    }
  }

  const removeService = (id: string) => {
    setServices(services.filter(s => s.id !== id))
  }

  const removeAddOn = (id: string) => {
    setAddOns(addOns.filter(a => a.id !== id))
  }

  const handleSave = () => {
    if (!session) return

    onSave({
      ...session,
      date,
      services,
      addOns,
      tips,
      review: !isHalo ? review : undefined,
      rating: !isHalo ? rating : undefined,
      hasClientReview: isHalo ? hasClientReview : undefined,
    })

    onClose()
  }

  if (!isOpen || !session) return null

  const totalEarnings = isHalo
    ? services.reduce((acc, s) => acc + (s.haloBasePrice || s.rate), 0)
    : services.reduce((acc, s) => acc + (s.rate / 60) * s.duration, 0)
  const addOnsTotal = addOns.reduce((acc, a) => acc + a.price, 0)
  const grandTotal = totalEarnings + addOnsTotal + tips

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Session</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="space-y-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              required
            />
          </div>

          {/* Services */}
          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Services</h3>

            <div className="space-y-4 mb-4">
              {isHalo ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Service Type</label>
                    <select
                      value={haloServiceType}
                      onChange={(e) => setHaloServiceType(e.target.value as 'massage' | 'deep-tissue' | 'advanced-bodywork')}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    >
                      <option value="massage">Massage (1hr=$50, 90min=$70, 2hr=$95)</option>
                      <option value="deep-tissue">Deep Tissue (+$7.50)</option>
                      <option value="advanced-bodywork">Advanced Bodywork (+$12.50)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Duration (minutes)</label>
                    <select
                      value={haloDuration}
                      onChange={(e) => setHaloDuration(Number(e.target.value))}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    >
                      <option value={60}>60 minutes</option>
                      <option value={90}>90 minutes</option>
                      <option value={120}>120 minutes (2 hours)</option>
                    </select>
                  </div>

                  <div className="bg-slate-700 p-3 rounded">
                    <p className="text-sm text-teal-300">
                      Payout: <span className="font-semibold text-white">${calculateHaloServicePayout(haloServiceType, haloDuration).toFixed(2)}</span>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Service Type</label>
                      <select
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value as 'massage' | 'deep-tissue')}
                        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                      >
                        <option value="massage">Massage</option>
                        <option value="deep-tissue">Deep Tissue</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Duration (min)</label>
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        min="15"
                        step="15"
                        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Hourly Rate ($)</label>
                    <input
                      type="number"
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      min="0"
                      step="0.01"
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={handleAddService}
                className={`w-full text-white px-4 py-2 rounded font-semibold transition-colors ${
                  isHalo
                    ? 'bg-teal-600 hover:bg-teal-700'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                + Add Service
              </button>
            </div>

            {services.length > 0 && (
              <div className="space-y-2">
                {services.map((service) => {
                  const payout = service.haloBasePrice || (service.rate / 60) * service.duration
                  return (
                    <div key={service.id} className="flex justify-between items-center bg-slate-700 p-3 rounded">
                      <span className="text-white">
                        {service.type.replace(/-/g, ' ')} - {service.duration}min
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">${payout.toFixed(2)}</span>
                        <button
                          type="button"
                          onClick={() => removeService(service.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Add-ons */}
          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Add-ons</h3>

            {isHalo ? (
              <div className="space-y-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-700 p-4 rounded">
                  {HALO_ADDONS.map(addon => (
                    <label key={addon.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-600 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedHaloAddOns.includes(addon.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedHaloAddOns([...selectedHaloAddOns, addon.id])
                          } else {
                            setSelectedHaloAddOns(selectedHaloAddOns.filter(id => id !== addon.id))
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-white flex-1">{addon.name}</span>
                      <span className="text-xs text-amber-400 font-semibold">${addon.price.toFixed(2)}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddAddOns}
                  disabled={selectedHaloAddOns.length === 0}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-semibold transition-colors"
                >
                  + Add Selected Add-ons ({selectedHaloAddOns.length})
                </button>
              </div>
            ) : null}

            {addOns.length > 0 && (
              <div className="space-y-2">
                {addOns.map((addon) => (
                  <div key={addon.id} className="flex justify-between items-center bg-slate-700 p-3 rounded">
                    <span className="text-white">{addon.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">${addon.price.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => removeAddOn(addon.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Tips ($)</label>
            <input
              type="number"
              value={tips}
              onChange={(e) => setTips(Number(e.target.value))}
              min="0"
              step="0.01"
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            />
          </div>

          {/* Review */}
          {!isHalo ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Customer Review (Optional)</label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Add any customer feedback or notes..."
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 h-24 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                >
                  <option value={5}>★★★★★ (5 Stars)</option>
                  <option value={4}>★★★★ (4 Stars)</option>
                  <option value={3}>★★★ (3 Stars)</option>
                  <option value={2}>★★ (2 Stars)</option>
                  <option value={1}>★ (1 Star)</option>
                </select>
              </div>
            </>
          ) : (
            <div className="border-t border-slate-700 pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasClientReview}
                  onChange={(e) => setHasClientReview(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-white font-semibold">Client Left a Review? (+$5)</span>
              </label>
            </div>
          )}

          {/* Summary */}
          <div className="border-t border-slate-700 pt-6 bg-slate-700 p-4 rounded">
            <div className="space-y-2 text-white">
              <div className="flex justify-between">
                <span>Services Payout:</span>
                <span className="font-semibold">${totalEarnings.toFixed(2)}</span>
              </div>
              {addOnsTotal > 0 && (
                <div className="flex justify-between">
                  <span>Add-ons:</span>
                  <span className="font-semibold">${addOnsTotal.toFixed(2)}</span>
                </div>
              )}
              {tips > 0 && (
                <div className="flex justify-between">
                  <span>Tips:</span>
                  <span className="font-semibold">${tips.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-slate-600 mt-2 pt-2 flex justify-between text-lg">
                <span>Total:</span>
                <span className={`font-bold ${isHalo ? 'text-blue-400' : 'text-amber-400'}`}>
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className={`flex-1 text-white px-6 py-3 rounded-lg font-semibold transition-colors ${
                isHalo
                  ? 'bg-teal-600 hover:bg-teal-700'
                  : 'bg-amber-500 hover:bg-amber-600'
              }`}
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

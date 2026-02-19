import { SessionData } from '../types'
import { calculateHaloTotalPayout, parseLocalDateString } from '../utils/haloPayroll'
import { Copy, Download } from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'

interface HaloPayrollSummaryProps {
  sessions: SessionData[]
  selectedDate?: string
}

export function HaloPayrollSummary({ sessions, selectedDate }: HaloPayrollSummaryProps) {
  const [copiedType, setCopiedType] = useState<'detailed' | 'totals' | null>(null)

  if (sessions.length === 0) {
    return null
  }

  // Use selectedDate or fall back to first session's date
  const dateToDisplay = selectedDate || sessions[0]?.date

  // Calculate session-by-session breakdown
  const sessionBreakdowns = sessions.map(session => ({
    session,
    breakdown: calculateHaloTotalPayout(
      session.services,
      session.addOns,
      session.tips,
      session.hasClientReview,
    ),
  }))

  // Calculate totals for all sessions
  const totals = {
    massage: 0,
    deepTissue: 0,
    addOns: 0,
    reviewBonus: 0,
    tips: 0,
    grandTotal: 0,
  }

  sessionBreakdowns.forEach(({ breakdown }) => {
    totals.massage += breakdown.massage
    totals.deepTissue += breakdown.deepTissue
    totals.addOns += breakdown.addOnsTotal
    totals.reviewBonus += breakdown.reviewBonus
    totals.tips += breakdown.tips
    totals.grandTotal += breakdown.total
  })

  // Format payroll for manager - with detailed session breakdown
  const payrollText = `HALO THERAPIES - DAILY TALLY
${dateToDisplay ? `Date: ${format(parseLocalDateString(dateToDisplay), 'MMMM d, yyyy')}` : 'Daily Summary'}

SESSION BREAKDOWN:
${sessionBreakdowns
  .map((item, idx) => {
    const reviewText = item.session.hasClientReview
      ? `\n  Review: $${item.breakdown.reviewBonus.toFixed(2)}${item.session.review ? ` - ${item.session.review}` : ''}`
      : '\n  Review: $0.00'

    return `Session ${idx + 1}:
  Massage: $${item.breakdown.massage.toFixed(2)}
  Deep Tissue: $${item.breakdown.deepTissue.toFixed(2)}
  Add-ons: $${item.breakdown.addOnsTotal.toFixed(2)}${reviewText}
  Tips: $${item.breakdown.tips.toFixed(2)}
  Total: $${item.breakdown.total.toFixed(2)}`
  })
  .join('\n\n')}

────────────────────────
DAILY TOTALS:

massage: $${totals.massage.toFixed(2)}
deep tissue: $${totals.deepTissue.toFixed(2)}
add ons: $${totals.addOns.toFixed(2)}
review: $${totals.reviewBonus.toFixed(2)}
tips: $${totals.tips.toFixed(2)}

TOTAL: $${totals.grandTotal.toFixed(2)}`

  // Format totals only for quick text - simple version
  const totalsOnlyText = `HALO THERAPIES - PANG VANG
DATE: ${dateToDisplay ? format(parseLocalDateString(dateToDisplay), 'MMMM d, yyyy') : format(new Date(), 'MMMM d, yyyy')}
Sessions: ${sessions.length}

SESSION BREAKDOWN:

massage: $${totals.massage.toFixed(2)}
deep tissue: $${totals.deepTissue.toFixed(2)}
add ons: $${totals.addOns.toFixed(2)}
review: $${totals.reviewBonus.toFixed(2)}
tips: $${totals.tips.toFixed(2)}
total: $${totals.grandTotal.toFixed(2)}`

  // Robust copy function with fallback for mobile
  const copyToClipboard = async (text: string) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
        return true
      }
    } catch (err) {
      console.error('Clipboard API failed:', err)
    }

    // Fallback: use textarea method
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return true
    } catch (err) {
      console.error('Fallback copy failed:', err)
      return false
    }
  }

  const handleCopyDetailed = async () => {
    const success = await copyToClipboard(payrollText)
    if (success) {
      setCopiedType('detailed')
      setTimeout(() => setCopiedType(null), 2000)
    }
  }

  const handleCopyTotalsOnly = async () => {
    const success = await copyToClipboard(totalsOnlyText)
    if (success) {
      setCopiedType('totals')
      setTimeout(() => setCopiedType(null), 2000)
    }
  }

  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([payrollText], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `halo-payroll-${selectedDate || format(new Date(), 'yyyy-MM-dd')}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Header with actions */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Daily Payroll Tally</h3>
            <p className="text-blue-200 text-sm">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleCopyDetailed}
              className="flex items-center gap-2 bg-blue-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
            >
              <Copy className="w-4 h-4" />
              {copiedType === 'detailed' ? 'Copied!' : 'Copy Detailed'}
            </button>
            <button
              onClick={handleCopyTotalsOnly}
              className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
            >
              <Copy className="w-4 h-4" />
              {copiedType === 'totals' ? 'Copied!' : 'Copy Totals'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-blue-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Copy/paste boxes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h4 className="text-white font-bold mb-2 text-xs">📋 DETAILED:</h4>
            <div className="bg-blue-950 p-3 rounded-lg font-mono text-xs text-blue-100 whitespace-pre-wrap overflow-y-auto max-h-48 border border-blue-700">
              {payrollText}
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-2 text-xs">📱 TOTALS ONLY:</h4>
            <div className="bg-green-950 p-3 rounded-lg font-mono text-xs text-green-100 whitespace-pre-wrap overflow-y-auto max-h-48 border border-green-700">
              {totalsOnlyText}
            </div>
          </div>
        </div>
      </div>

      {/* Session-by-session breakdown */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Session Breakdown</h3>
        {sessionBreakdowns.map((item, idx) => (
          <div key={item.session.id} className="bg-slate-800 rounded-lg p-4 border border-slate-600">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-white font-semibold">Session {idx + 1}</h4>
              <span className="text-blue-600 text-sm">{format(parseLocalDateString(item.session.date), 'MMM d • h:mma')}</span>
            </div>
            
            <div className="space-y-2 text-sm">
              {item.breakdown.massage > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-300">Massage:</span>
                  <span className="text-white font-semibold">${item.breakdown.massage.toFixed(2)}</span>
                </div>
              )}
              {item.breakdown.deepTissue > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-300">Deep Tissue:</span>
                  <span className="text-white font-semibold">${item.breakdown.deepTissue.toFixed(2)}</span>
                </div>
              )}
              {item.breakdown.addOnsTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-300">Add-ons:</span>
                  <span className="text-white font-semibold">${item.breakdown.addOnsTotal.toFixed(2)}</span>
                </div>
              )}
              {item.breakdown.reviewBonus > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-300">Review:</span>
                  <span className="text-white font-semibold">${item.breakdown.reviewBonus.toFixed(2)}</span>
                </div>
              )}
              {item.breakdown.tips > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-300">Tips:</span>
                  <span className="text-white font-semibold">${item.breakdown.tips.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-600 pt-2 mt-2">
                <span className="text-white font-semibold">Total:</span>
                <span className="text-blue-600 font-bold text-lg">${item.breakdown.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Aggregated totals */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-6">Daily Totals</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Breakdown list */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm border-b border-amber-700 pb-2">
              <span className="text-blue-200">Massage:</span>
              <span className="text-white font-semibold">${totals.massage.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm border-b border-amber-700 pb-2">
              <span className="text-blue-200">Deep Tissue:</span>
              <span className="text-white font-semibold">${totals.deepTissue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm border-b border-amber-700 pb-2">
              <span className="text-blue-200">Add-ons:</span>
              <span className="text-white font-semibold">${totals.addOns.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm border-b border-amber-700 pb-2">
              <span className="text-blue-200">Review:</span>
              <span className="text-white font-semibold">${totals.reviewBonus.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-200">Tips:</span>
              <span className="text-white font-semibold">${totals.tips.toFixed(2)}</span>
            </div>
          </div>

          {/* Total payout card */}
          <div className="bg-blue-600 p-4 rounded-lg border-2 border-teal-500 flex flex-col justify-center">
            <div className="text-center">
              <p className="text-white text-sm font-semibold mb-2">TOTAL PAYOUT</p>
              <p className="text-white font-bold text-4xl">${totals.grandTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

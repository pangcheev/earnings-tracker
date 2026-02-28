import { supabase } from './supabase'
import { SessionData } from '../types'

export interface QueryFilters {
  startDate?: string
  endDate?: string
  location?: 'soul-bridge' | 'halo' | 'all'
  serviceType?: 'massage' | 'deep-tissue' | 'advanced-bodywork' | 'all'
  minTips?: number
  maxTips?: number
  sortBy?: 'date' | 'earnings' | 'duration'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Query sessions from Supabase with optional filters
 */
export async function querySessionsFromCloud(filters: QueryFilters): Promise<SessionData[]> {
  if (!supabase) {
    console.warn('⚠️  Supabase not configured')
    return []
  }

  try {
    let query = supabase.from('sessions').select('*')

    // Apply date range filters
    if (filters.startDate) {
      query = query.gte('date', filters.startDate)
    }
    if (filters.endDate) {
      query = query.lte('date', filters.endDate)
    }

    // Apply location filter
    if (filters.location && filters.location !== 'all') {
      const business = filters.location === 'halo' ? 'halo' : 'soul'
      query = query.eq('business', business)
    }

    // Apply service type filter
    if (filters.serviceType && filters.serviceType !== 'all') {
      query = query.eq('service_type', filters.serviceType)
    }

    // Apply sorting
    const sortField = filters.sortBy === 'earnings' ? 'total_payout' : filters.sortBy === 'duration' ? 'duration' : 'date'
    const sortOrder = filters.sortOrder === 'desc' || !filters.sortOrder
    query = query.order(sortField, { ascending: !sortOrder })

    const { data, error } = await query

    if (error) {
      console.warn('❌ Query failed:', error.message)
      return []
    }

    console.log('☁️  Queried', data?.length || 0, 'sessions from Supabase')

    // Convert database format to SessionData format and apply tips filters if provided
    const sessions = (data || [])
      .map((row: any) => {
        const addOnsArray: any[] = []

        if (row.add_ons && row.add_ons > 0) {
          addOnsArray.push({ id: `addon-${row.id}`, name: 'Add-ons', price: row.add_ons })
        }

        if (row.deeptissue_lymp_sport && row.deeptissue_lymp_sport > 0 && row.service_type !== 'deep-tissue') {
          addOnsArray.push({
            id: `deep-tissue-${row.id}`,
            name: 'Deep Tissue / Sports / Lymphatic',
            price: row.deeptissue_lymp_sport,
            haloCode: 'deep-tissue'
          })
        }

        if (row.advanced_bodywork && row.advanced_bodywork > 0 && row.service_type !== 'advanced-bodywork') {
          addOnsArray.push({
            id: `advanced-bodywork-${row.id}`,
            name: 'Advanced Bodywork',
            price: row.advanced_bodywork,
            haloCode: 'advanced-bodywork'
          })
        }

        return {
          id: row.id,
          location: row.business === 'halo' ? 'halo' : 'soul-bridge',
          date: row.date,
          services: [
            {
              id: `${row.id}-service`,
              type: row.service_type,
              duration: row.duration,
              rate: row.base_price,
            }
          ],
          addOns: addOnsArray,
          tips: row.tips || 0,
          review: row.review || 0,
          haloPayoutAmount: row.total_payout,
        } as SessionData
      })
      // Apply tips filter on the client side
      .filter(session => {
        if (filters.minTips !== undefined && session.tips < filters.minTips) return false
        if (filters.maxTips !== undefined && session.tips > filters.maxTips) return false
        return true
      })

    return sessions
  } catch (err) {
    console.warn('❌ Query error:', err)
    return []
  }
}

/**
 * Export queried sessions to CSV format
 */
export function exportToCsv(sessions: SessionData[], filename: string = 'sessions-export.csv'): void {
  const headers = ['Date', 'Location', 'Service Type', 'Duration (min)', 'Base Price', 'Add-ons', 'Tips', 'Total']
  
  const rows = sessions.map(session => {
    const firstService = session.services[0]
    const location = session.location === 'halo' ? 'Halo Therapies' : 'Soul Bridge Healing'
    const serviceType = firstService?.type || 'Unknown'
    const duration = firstService?.duration || 0
    const basePrice = firstService?.rate || 0
    const addOnsTotal = session.addOns.reduce((sum, addon) => sum + addon.price, 0)
    const tips = session.tips || 0
    const total = basePrice + addOnsTotal + tips

    return [
      session.date,
      location,
      serviceType,
      duration,
      basePrice.toFixed(2),
      addOnsTotal.toFixed(2),
      tips.toFixed(2),
      total.toFixed(2),
    ]
  })

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export queried sessions to JSON format
 */
export function exportToJson(sessions: SessionData[], filename: string = 'sessions-export.json'): void {
  const data = {
    exportDate: new Date().toISOString(),
    sessionCount: sessions.length,
    sessions: sessions.map(session => ({
      id: session.id,
      date: session.date,
      location: session.location,
      services: session.services,
      addOns: session.addOns,
      tips: session.tips,
      review: session.review,
      haloPayoutAmount: session.haloPayoutAmount,
    }))
  }

  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

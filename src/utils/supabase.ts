import { createClient } from '@supabase/supabase-js'
import { SessionData } from '../types'

// Initialize Supabase client
const supabaseUrl = (import.meta.env as any).VITE_SUPABASE_URL
const supabaseAnonKey = (import.meta.env as any).VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️  Supabase credentials not configured. Using localStorage fallback.\n' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to environment for cloud sync.'
  )
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Load all sessions from Supabase
export async function loadSessionsFromCloud(): Promise<SessionData[] | null> {
  if (!supabase) {
    console.log('📱 Using localStorage (Supabase not configured)')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('❌ Failed to load from cloud:', error.message)
      return null
    }

    console.log('☁️  Loaded', data?.length || 0, 'sessions from Supabase')
    
    // Convert database format to SessionData format
    const sessions = (data || []).map((row: any) => {
      // Reconstruct add-ons array from database columns
      const addOnsArray: any[] = []
      
      // Add regular add-ons
      if (row.add_ons && row.add_ons > 0) {
        addOnsArray.push({ id: `addon-${row.id}`, name: 'Add-ons', price: row.add_ons })
      }
      
      // Reconstruct surcharge add-ons only if service type is NOT that type
      // E.g., if service is 'massage' but has deep_tissue_surcharge, it's an add-on
      if (row.deep_tissue_surcharge && row.deep_tissue_surcharge > 0 && row.service_type !== 'deep-tissue') {
        addOnsArray.push({
          id: `deep-tissue-${row.id}`,
          name: 'Deep Tissue / Sports / Lymphatic',
          price: row.deep_tissue_surcharge,
          haloCode: 'deep-tissue'
        })
      }
      if (row.advanced_bodywork_surcharge && row.advanced_bodywork_surcharge > 0 && row.service_type !== 'advanced-bodywork') {
        addOnsArray.push({
          id: `advanced-bodywork-${row.id}`,
          name: 'Advanced Bodywork',
          price: row.advanced_bodywork_surcharge,
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
        haloPayoutAmount: row.halo_payout_amount,
      } as SessionData
    })
    
    return sessions
  } catch (err) {
    console.warn('❌ Cloud sync error:', err)
    return null
  }
}

// Sync all sessions to Supabase
export async function syncSessionsToCloud(sessions: SessionData[]): Promise<boolean> {
  if (!supabase || sessions.length === 0) return false

  try {
    const sessionsToSync = sessions.map((session) => {
      // Extract first service (since each session has only ONE service)
      const firstService = session.services[0]
      const serviceType = firstService?.type || 'massage'
      
      // Calculate base price and surcharges
      const basePrice = Number(firstService?.rate || 0)
      const review = Number(session.review || 0)
      const tips = Number(session.tips || 0)
      
      // Set surcharge columns based on service type AND add-ons
      let deepTissueSurcharge = 0
      let advancedBodyworkSurcharge = 0
      
      // Add service type surcharge if service was booked with that type
      if (serviceType === 'deep-tissue') {
        deepTissueSurcharge = 7.50
      } else if (serviceType === 'advanced-bodywork') {
        advancedBodyworkSurcharge = 12.50
      }
      
      // Process add-ons: service-type surcharges go to surcharge columns, others go to add_ons total
      let totalAddOns = 0
      session.addOns.forEach(addon => {
        const checkId = (addon as any).haloCode || addon.id
        // If add-on is a service type surcharge, add to surcharge column
        if (checkId === 'deep-tissue') {
          deepTissueSurcharge += addon.price
        } else if (checkId === 'advanced-bodywork') {
          advancedBodyworkSurcharge += addon.price
        } else {
          // Only non-surcharge add-ons count toward add_ons total
          totalAddOns += Number(addon.price || 0)
        }
      })
      
      // Calculate total payout: base + surcharges + other add-ons + review + tips
      const haloTotal = session.location === 'halo' 
        ? basePrice + deepTissueSurcharge + advancedBodyworkSurcharge + totalAddOns + review + tips 
        : null
      
      return {
        id: session.id,
        date: session.date,
        business: session.location === 'halo' ? 'halo' : 'soul',
        service_type: serviceType,
        duration: firstService?.duration || 0,
        base_price: basePrice,
        add_ons: totalAddOns,
        review: review,
        tips: tips,
        deep_tissue_surcharge: deepTissueSurcharge,
        advanced_bodywork_surcharge: advancedBodyworkSurcharge,
        halo_payout_amount: haloTotal,
        updated_at: new Date().toISOString(),
      }
    })

    const { error } = await supabase
      .from('sessions')
      .upsert(sessionsToSync, { onConflict: 'id' })

    if (error) {
      console.warn('❌ Sync failed:', error.message)
      return false
    }

    console.log('☁️  Synced', sessions.length, 'sessions to Supabase')
    return true
  } catch (err) {
    console.warn('❌ Sync error:', err)
    return false
  }
}

// Delete a session from Supabase
export async function deleteSessionFromCloud(sessionId: string): Promise<boolean> {
  if (!supabase) return false

  try {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)

    if (error) {
      console.warn('❌ Failed to delete session:', error.message)
      return false
    }

    console.log('☁️  Deleted session from Supabase')
    return true
  } catch (err) {
    console.warn('❌ Failed to delete from cloud:', err)
    return false
  }
}

// Get all closed dates from Supabase
export async function getClosedDatesFromCloud(): Promise<Record<string, boolean> | null> {
  if (!supabase) {
    console.log('⚠️  Supabase not configured, skipping closed dates load')
    return null
  }

  try {
    console.log('🔍 Loading closed dates from Supabase...')
    const { data, error } = await supabase
      .from('sessions')
      .select('date, closed_date')
      .not('closed_date', 'is', null)

    if (error) {
      console.warn('❌ Failed to load closed dates:', error.message)
      return null
    }

    console.log('📊 Raw data from Supabase:', data)
    
    const closedDatesMap: Record<string, boolean> = {}
    const seenDates = new Set<string>()
    
    data?.forEach((row: any) => {
      if (row.closed_date && !seenDates.has(row.date)) {
        closedDatesMap[row.date] = true
        seenDates.add(row.date)
        console.log(`✅ Marked date as closed: ${row.date}`)
      }
    })

    console.log('☁️  Loaded closed dates from Supabase:', Object.keys(closedDatesMap))
    return closedDatesMap
  } catch (err) {
    console.warn('❌ Failed to fetch closed dates:', err)
    return null
  }
}

// Mark a date as closed in Supabase
export async function setDateClosedInCloud(date: string): Promise<boolean> {
  if (!supabase) {
    console.warn('❌ Supabase not configured')
    return false
  }

  try {
    const closedAt = new Date().toISOString()
    
    const { data, error, status } = await supabase
      .from('sessions')
      .update({ closed_date: closedAt })
      .eq('date', date)

    if (error) {
      console.error('❌ Supabase error closing date:', {
        message: error.message,
        code: error.code,
        status,
        date
      })
      return false
    }

    console.log('☁️  Closed date', date, 'in Supabase', { data, status })
    return true
  } catch (err) {
    console.error('❌ Exception closing date in cloud:', err)
    return false
  }
}

// Mark a date as open in Supabase
export async function setDateOpenInCloud(date: string): Promise<boolean> {
  if (!supabase) {
    console.warn('❌ Supabase not configured')
    return false
  }

  try {
    const { data, error, status } = await supabase
      .from('sessions')
      .update({ closed_date: null })
      .eq('date', date)

    if (error) {
      console.error('❌ Supabase error reopening date:', {
        message: error.message,
        code: error.code,
        status,
        date
      })
      return false
    }

    console.log('☁️  Reopened date', date, 'in Supabase', { data, status })
    return true
  } catch (err) {
    console.error('❌ Exception reopening date in cloud:', err)
    return false
  }
}

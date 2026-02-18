import { createClient } from '@supabase/supabase-js'
import { SessionData } from '../types'

// Initialize Supabase client
const supabaseUrl = (import.meta.env as any).VITE_SUPABASE_URL
const supabaseAnonKey = (import.meta.env as any).VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️  Supabase credentials not configured. Using localStorage fallback.\n' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local to enable cloud sync.'
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
      // Reconstruct add-ons array if there's a total
      const addOnsArray: any[] = row.add_ons && row.add_ons > 0 
        ? [{ id: `addon-${row.id}`, name: 'Add-ons', price: row.add_ons }]
        : []
      
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
      
      // Sum all add-ons (in case there are multiple)
      const totalAddOns = session.addOns.reduce((sum, addon) => sum + Number(addon.price || 0), 0)
      
      // Calculate total payout for halo sessions: base_price + add_ons + review + tips
      const basePrice = Number(firstService?.rate || 0)
      const review = Number(session.review || 0)
      const tips = Number(session.tips || 0)
      const haloTotal = session.location === 'halo' ? basePrice + totalAddOns + review + tips : null
      
      return {
        id: session.id,
        date: session.date,
        business: session.location === 'halo' ? 'halo' : 'soul',
        service_type: firstService?.type || 'massage',
        duration: firstService?.duration || 0,
        base_price: basePrice,
        add_ons: totalAddOns,
        review: review,
        tips: tips,
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

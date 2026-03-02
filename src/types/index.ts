export interface ServiceEntry {
  id: string
  type: 'massage' | 'deep-tissue' | 'advanced-bodywork' | 'dry-brush'
  duration: number // in minutes
  rate: number // hourly rate for Soul Bridge, will be calculated for Halo
  haloBasePrice?: number // For Halo services with fixed pricing
}

export interface AddOn {
  id: string
  name: string
  price: number
  haloCode?: string // For Halo-specific add-ons
}

export interface SessionData {
  id: string
  user_id?: string // User ID from Supabase auth
  location: 'halo'
  date: string
  services: ServiceEntry[]
  addOns: AddOn[]
  tips: number
  review?: string
  hasClientReview?: boolean // For Halo - did client review? (+$5)
  haloPayoutAmount?: number // Calculated payout for Halo sessions
}

export interface BusinessLocation {
  id: 'halo'
  name: string
  type: 'contractor'
  description: string
}

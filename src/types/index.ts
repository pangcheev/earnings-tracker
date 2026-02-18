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
  location: 'soul-bridge' | 'halo'
  date: string
  services: ServiceEntry[]
  addOns: AddOn[]
  tips: number
  review?: string
  rating?: number // 1-5 (for Soul Bridge only)
  hasClientReview?: boolean // For Halo - did client review? (+$5)
  haloPayoutAmount?: number // Calculated payout for Halo sessions
}

export interface BusinessLocation {
  id: 'soul-bridge' | 'halo'
  name: string
  type: 'owner' | 'contractor'
  description: string
}

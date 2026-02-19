// Halo Therapies - Payroll Structure & Add-ons

export const HALO_SERVICE_PRICING = {
  // Base service pricing (minutes -> payout)
  basePricing: {
    60: 50,      // 1 hour
    90: 70,      // 90 minutes
    120: 95,     // 2 hours
  },
  
  // Service type additions
  serviceAdditions: {
    'deep-tissue': 7.50,      // Deep tissue & sports & lymphatic
    'advanced-bodywork': 12.50, // Advanced bodywork
  },
  
  // Bonus for 5-star reviews
  fiveStarBonus: 5,
}

export const HALO_ADDONS = [
  { id: 'advanced-bodywork', name: 'Advanced Bodywork', price: 12.50 },
  { id: 'argon-eye', name: 'Argon Eye Treatment', price: 10.00 },
  { id: 'balance-bomb', name: 'Balance Bomb', price: 5.00 },
  { id: 'cupping', name: 'Cupping', price: 12.50 },
  { id: 'deep-tissue', name: 'Deep Tissue / Sports / Lymphatic', price: 7.50 },
  { id: 'dry-brushing-12.5', name: 'Dry Brushing ($12.50)', price: 12.50 },
  { id: 'dry-brushing-25', name: 'Dry Brushing ($25)', price: 25.00 },
  { id: 'dry-brushing-50', name: 'Dry Brushing ($50)', price: 50.00 },
  { id: 'extra-15-min', name: 'Extra 15 Minutes', price: 12.50 },
  { id: 'hot-salt-stones', name: 'Hot Salt Stones', price: 12.50 },
  { id: 'peppermint-rosemary', name: 'Peppermint Rosemary Scalp & Foot', price: 10.00 },
  { id: 'spellbound', name: 'Spellbound (10% commission)', price: 3.00 },
  { id: 'turmeric-face', name: 'Turmeric Face Oil', price: 10.00 },
  { id: 'vetiver-guasha', name: 'Vetiver Guasha Treatment', price: 10.00 },
]

/**
 * Calculate the base massage payout for a given duration (without service type surcharges)
 */
export function calculateHaloBaseMassagePrice(duration: number): number {
  let basePayout = 0

  // Find matching base pricing tier (exact or next lower)
  const rates = Object.keys(HALO_SERVICE_PRICING.basePricing)
    .map(Number)
    .sort((a, b) => a - b)

  const matchingRate = rates.find(rate => duration === rate)
  if (matchingRate) {
    basePayout = HALO_SERVICE_PRICING.basePricing[matchingRate as keyof typeof HALO_SERVICE_PRICING.basePricing]
  } else {
    // If duration doesn't match exactly, calculate by hourly rate
    // Find closest tier
    const closestRate = rates.reduce((prev, curr) => {
      return Math.abs(curr - duration) < Math.abs(prev - duration) ? curr : prev
    })
    const closestPayout = HALO_SERVICE_PRICING.basePricing[closestRate as keyof typeof HALO_SERVICE_PRICING.basePricing]
    const closestHourly = closestPayout / (closestRate / 60)
    basePayout = (closestHourly / 60) * duration
  }

  return basePayout
}

export function calculateHaloServicePayout(
  serviceType: string,
  duration: number,
): number {
  let basePayout = calculateHaloBaseMassagePrice(duration)

  // Add service-type bonus
  if (serviceType === 'deep-tissue') {
    basePayout += HALO_SERVICE_PRICING.serviceAdditions['deep-tissue']
  } else if (serviceType === 'advanced-bodywork') {
    basePayout += HALO_SERVICE_PRICING.serviceAdditions['advanced-bodywork']
  }

  return basePayout
}

export function calculateHaloTotalPayout(
  services: Array<{ type: string; duration: number }>,
  addOns: Array<{ id?: string; name: string; price: number }>,
  tips: number,
  hasClientReview?: boolean,
): {
  massage: number
  deepTissue: number
  advancedBodywork: number
  addOnsTotal: number
  reviewBonus: number
  tips: number
  total: number
} {
  let massageTotal = 0
  let deepTissueTotal = 0
  let advancedBodyworkTotal = 0
  let addOnsTotal = 0

  // Separate base pay from surcharges
  services.forEach(service => {
    // Calculate base payout (without service type bonus)
    let basePayout = 0
    const rates = Object.keys(HALO_SERVICE_PRICING.basePricing)
      .map(Number)
      .sort((a, b) => a - b)
    
    const matchingRate = rates.find(rate => service.duration === rate)
    if (matchingRate) {
      basePayout = HALO_SERVICE_PRICING.basePricing[matchingRate as keyof typeof HALO_SERVICE_PRICING.basePricing]
    } else {
      const closestRate = rates.reduce((prev, curr) => {
        return Math.abs(curr - service.duration) < Math.abs(prev - service.duration) ? curr : prev
      })
      const closestPayout = HALO_SERVICE_PRICING.basePricing[closestRate as keyof typeof HALO_SERVICE_PRICING.basePricing]
      const closestHourly = closestPayout / (closestRate / 60)
      basePayout = (closestHourly / 60) * service.duration
    }

    // Add base to massage total
    massageTotal += basePayout

    // Add service-type surcharge to appropriate total
    if (service.type === 'deep-tissue') {
      deepTissueTotal += HALO_SERVICE_PRICING.serviceAdditions['deep-tissue']
    } else if (service.type === 'advanced-bodywork') {
      advancedBodyworkTotal += HALO_SERVICE_PRICING.serviceAdditions['advanced-bodywork']
    }
  })

  // Separate add-ons: service type surcharges go to their respective line, others go to add-ons
  addOns.forEach(addon => {
    // Check both id and haloCode for backwards compatibility
    const checkId = (addon as any).haloCode || addon.id
    if (checkId === 'deep-tissue') {
      // Deep Tissue surcharges go to deep tissue breakdown
      deepTissueTotal += addon.price
    } else if (checkId === 'advanced-bodywork') {
      // Advanced Bodywork surcharges go to advanced bodywork breakdown
      advancedBodyworkTotal += addon.price
    } else {
      // All other add-ons go to add-ons total
      addOnsTotal += addon.price
    }
  })

  // Client review bonus
  const reviewBonus = hasClientReview ? HALO_SERVICE_PRICING.fiveStarBonus : 0

  const total = massageTotal + deepTissueTotal + advancedBodyworkTotal + addOnsTotal + reviewBonus + tips

  return {
    massage: massageTotal,
    deepTissue: deepTissueTotal,
    advancedBodywork: advancedBodyworkTotal,
    addOnsTotal,
    reviewBonus,
    tips,
    total,
  }
}

/**
 * Convert local date to YYYY-MM-DD format (accounts for timezone)
 * Fixes issue where new Date().toISOString() uses UTC and can be off by a day
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parse a date string (YYYY-MM-DD) as local time, not UTC
 * This fixes issues where new Date("2026-02-02") is interpreted as UTC midnight
 */
export function parseLocalDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

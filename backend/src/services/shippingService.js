// Shipping service for calculating shipping costs based on location and weight

const SHIPPING_RATES = {
  domestic: {
    standard: { base: 5.99, perKg: 1.50 },
    express: { base: 12.99, perKg: 3.00 }
  },
  international: {
    standard: { base: 15.99, perKg: 4.00 },
    express: { base: 29.99, perKg: 7.00 }
  }
}

const REGIONS = {
  domestic: ['US', 'CA'], // Example: United States, Canada
  international: ['other'] // All others
}

/**
 * Determines the region based on country code
 * @param {string} countryCode - ISO country code
 * @returns {string} - 'domestic' or 'international'
 */
function getRegion (countryCode) {
  if (REGIONS.domestic.includes(countryCode)) {
    return 'domestic'
  }
  return 'international'
}

/**
 * Calculates shipping cost
 * @param {string} countryCode - Destination country code
 * @param {number} totalWeight - Total weight in kg
 * @param {string} shippingOption - 'standard' or 'express'
 * @returns {number} - Shipping cost
 */
function calculateShippingCost (countryCode, totalWeight, shippingOption) {
  const region = getRegion(countryCode)
  const rates = SHIPPING_RATES[region][shippingOption]

  if (!rates) {
    throw new Error(`Invalid shipping option: ${shippingOption}`)
  }

  const cost = rates.base + (totalWeight * rates.perKg)
  return Math.round(cost * 100) / 100 // Round to 2 decimal places
}

/**
 * Gets available shipping options with costs
 * @param {string} countryCode - Destination country code
 * @param {number} totalWeight - Total weight in kg
 * @returns {Array} - Array of shipping options with costs
 */
function getShippingOptions (countryCode, totalWeight) {
  const region = getRegion(countryCode)
  const options = []

  for (const option in SHIPPING_RATES[region]) {
    const cost = calculateShippingCost(countryCode, totalWeight, option)
    options.push({
      type: option,
      cost,
      estimatedDays: option === 'standard' ? '5-7 days' : '1-2 days'
    })
  }

  return options
}

module.exports = {
  calculateShippingCost,
  getShippingOptions,
  getRegion
}

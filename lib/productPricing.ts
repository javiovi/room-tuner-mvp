/**
 * Product Pricing Utilities
 * Enrich products with real-time prices from MercadoLibre
 */

import type { AcousticProduct } from "./acousticProducts"

interface MLProductResult {
  id: string
  name: string
  price: number
  currency: string
  link: string
  thumbnail: string
  condition: string
}

export interface EnrichedProduct extends AcousticProduct {
  realPrice?: number
  realLink?: string
  realThumbnail?: string
  priceSource: 'database' | 'mercadolibre'
  priceUpdatedAt?: string
}

/**
 * Search for a product on MercadoLibre and get real price
 * Server-side version that calls ML API directly
 */
async function searchProductPriceServer(searchTerm: string): Promise<MLProductResult | null> {
  try {
    const response = await fetch(
      `https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(searchTerm)}&limit=1`,
      {
        headers: { "Accept": "application/json" }
      }
    )

    if (!response.ok) {
      console.warn(`[Pricing] ML API failed for "${searchTerm}":`, response.status)
      return null
    }

    const data = await response.json()

    if (!data.results || data.results.length === 0) {
      console.warn(`[Pricing] No products found for "${searchTerm}"`)
      return null
    }

    const item = data.results[0]
    return {
      id: item.id,
      name: item.title,
      price: item.price,
      currency: item.currency_id,
      link: item.permalink,
      thumbnail: item.thumbnail,
      condition: item.condition,
    }
  } catch (error) {
    console.error(`[Pricing] Error searching for "${searchTerm}":`, error)
    return null
  }
}

/**
 * Search for a product on MercadoLibre and get real price
 * Client-side version that calls our API endpoint
 */
async function searchProductPriceClient(searchTerm: string): Promise<MLProductResult | null> {
  try {
    const response = await fetch(
      `/api/search-products?q=${encodeURIComponent(searchTerm)}&limit=1`
    )

    if (!response.ok) {
      console.warn(`[Pricing] Failed to search for "${searchTerm}":`, response.status)
      return null
    }

    const data = await response.json()

    if (!data.products || data.products.length === 0) {
      console.warn(`[Pricing] No products found for "${searchTerm}"`)
      return null
    }

    return data.products[0]
  } catch (error) {
    console.error(`[Pricing] Error searching for "${searchTerm}":`, error)
    return null
  }
}

/**
 * Search term for MercadoLibre — sourced directly from the product's own
 * linkML query so the live search always matches what the catalog links to.
 */
function generateSearchTerm(product: AcousticProduct): string {
  return product.searchTermML || `${product.category} acustico`
}

/**
 * Reject an ML hit that isn't actually a plausible match for this product —
 * wrong currency, or a price wildly outside the catalog's own range (a sign
 * the top search result is an unrelated item, not the accessory itself).
 */
function isPlausibleMatch(product: AcousticProduct, mlProduct: MLProductResult): boolean {
  if (mlProduct.currency !== "ARS") return false
  const catalogPrice = product.priceARS
  if (!catalogPrice) return true
  return mlProduct.price >= catalogPrice * 0.2 && mlProduct.price <= catalogPrice * 5
}

/**
 * Enrich a single product with real-time price
 */
export async function enrichProductWithRealPrice(
  product: AcousticProduct,
  options: { useServer?: boolean } = {}
): Promise<EnrichedProduct> {
  const { useServer = false } = options
  const searchTerm = generateSearchTerm(product)

  const mlResult = useServer
    ? await searchProductPriceServer(searchTerm)
    : await searchProductPriceClient(searchTerm)

  const mlProduct = mlResult && isPlausibleMatch(product, mlResult) ? mlResult : null
  if (mlResult && !mlProduct) {
    console.warn(`[Pricing] Rejected implausible ML match for "${product.id}":`, mlResult.price, mlResult.currency)
  }

  if (mlProduct) {
    return {
      ...product,
      realPrice: mlProduct.price,
      realLink: mlProduct.link,
      realThumbnail: mlProduct.thumbnail,
      priceSource: 'mercadolibre',
      priceUpdatedAt: new Date().toISOString(),
      // Override database prices with real ones
      priceARS: mlProduct.price,
      link: mlProduct.link,
    }
  }

  // Fallback to database prices, use linkML as fallback link for ES
  return {
    ...product,
    link: product.linkML || product.link,
    priceSource: 'database',
  }
}

/**
 * Enrich multiple products with real-time prices
 * Processes in batches to avoid rate limiting
 */
export async function enrichProductsWithRealPrices(
  products: AcousticProduct[],
  options: { batchSize?: number; delay?: number; useServer?: boolean } = {}
): Promise<EnrichedProduct[]> {
  const { batchSize = 3, delay = 500, useServer = false } = options
  const enriched: EnrichedProduct[] = []

  // Process in batches
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize)

    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map(product => enrichProductWithRealPrice(product, { useServer }))
    )

    enriched.push(...batchResults)

    // Delay between batches to avoid rate limiting
    if (i + batchSize < products.length) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  const realPriceCount = enriched.filter(p => p.priceSource === 'mercadolibre').length
  console.log(
    `[Pricing] Enriched ${enriched.length} products (${realPriceCount} with real prices from ML)`
  )

  return enriched
}

/**
 * Get average price from multiple products
 */
export function calculateAveragePriceFromML(
  category: string,
  searchTerm: string,
  limit: number = 5
): Promise<{ average: number; count: number; products: MLProductResult[] } | null> {
  return fetch(`/api/search-products?q=${encodeURIComponent(searchTerm)}&limit=${limit}`)
    .then(res => res.json())
    .then(data => {
      if (!data.products || data.products.length === 0) {
        return null
      }

      const prices = data.products.map((p: MLProductResult) => p.price)
      const average = prices.reduce((a: number, b: number) => a + b, 0) / prices.length

      return {
        average: Math.round(average),
        count: prices.length,
        products: data.products,
      }
    })
    .catch(error => {
      console.error(`[Pricing] Error calculating average for "${searchTerm}":`, error)
      return null
    })
}

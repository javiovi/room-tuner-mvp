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

interface EnrichedProduct extends AcousticProduct {
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
 * Generate search term for MercadoLibre based on product category
 */
function generateSearchTerm(product: AcousticProduct): string {
  const searchTerms: Record<string, string> = {
    'foam-panel-5cm': 'panel espuma acustica 5cm',
    'foam-panel-10cm': 'panel espuma acustica 10cm',
    'rockwool-panel-60x120': 'panel lana de roca acustica',
    'pro-acoustic-panel-60x120': 'panel acustico profesional',
    'corner-bass-trap-basic': 'trampa graves esquina acustica',
    'corner-bass-trap-pro': 'bass trap esquina profesional',
    'superchunk-diy-kit': 'lana de roca trampa graves',
    'membrane-bass-trap': 'absorber membrana graves',
    'qrd-diffuser-wood': 'difusor acustico QRD',
    'skyline-diffuser': 'difusor skyline acustico',
    'poly-diffuser': 'difusor acustico poliédrico',
    'thick-rug-2x3': 'alfombra pelo grueso 2x3',
    'thick-rug-3x4': 'alfombra gruesa 3x4',
    'acoustic-carpet-tile': 'alfombra modular acustica',
    'heavy-curtain': 'cortina gruesa blackout',
    'velvet-curtain': 'cortina terciopelo pesado',
    'acoustic-curtain-pro': 'cortina acustica profesional',
    'door-seal-kit': 'burletes puerta antiruido',
    'acoustic-foam-adhesive': 'adhesivo espuma acustica',
    'isolation-pads': 'pads aislacion monitores',
    'speaker-stands': 'soportes parlantes monitores',
    'bass-shaker': 'bass shaker transductor',
  }

  // Return specific search term or fallback to category + "acustico"
  return searchTerms[product.id] || `${product.category} acustico`
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

  const mlProduct = useServer
    ? await searchProductPriceServer(searchTerm)
    : await searchProductPriceClient(searchTerm)

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

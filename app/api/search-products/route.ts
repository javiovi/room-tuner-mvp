import { NextResponse } from "next/server"
import { searchProductsQuerySchema } from "@/lib/validation/schemas"

/**
 * MercadoLibre Product Search API
 * Searches for acoustic products in MercadoLibre Argentina
 */

interface MLSearchResult {
  id: string
  title: string
  price: number
  currency_id: string
  thumbnail: string
  permalink: string
  condition: string
  seller: {
    id: number
  }
}

interface MLSearchResponse {
  results: MLSearchResult[]
  paging: {
    total: number
    limit: number
  }
}

interface ProductSearchResult {
  id: string
  name: string
  price: number
  currency: string
  link: string
  thumbnail: string
  condition: string
}

// Cache de búsquedas (simple in-memory cache)
// En producción usar Redis o similar
const searchCache = new Map<string, { data: ProductSearchResult[], timestamp: number }>()
const CACHE_TTL = 1000 * 60 * 60 // 1 hora

/**
 * Search products on MercadoLibre
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const parsed = searchProductsQuerySchema.safeParse({
      q: searchParams.get("q") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const { q: query, limit } = parsed.data

    // Check cache
    const cacheKey = `${query}-${limit}`
    const cached = searchCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[ML API] Cache hit for "${query}"`)
      return NextResponse.json({
        products: cached.data,
        cached: true,
        source: "cache"
      })
    }

    // Search on MercadoLibre API
    console.log(`[ML API] Searching for "${query}"`)
    const mlResponse = await fetch(
      `https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(query)}&limit=${limit}`,
      {
        headers: {
          "Accept": "application/json"
        }
      }
    )

    if (!mlResponse.ok) {
      throw new Error(`MercadoLibre API error: ${mlResponse.status}`)
    }

    const data: MLSearchResponse = await mlResponse.json()

    // Transform results
    const products: ProductSearchResult[] = data.results.map(item => ({
      id: item.id,
      name: item.title,
      price: item.price,
      currency: item.currency_id, // ARS for Argentina
      link: item.permalink,
      thumbnail: item.thumbnail,
      condition: item.condition
    }))

    // Cache results
    searchCache.set(cacheKey, {
      data: products,
      timestamp: Date.now()
    })

    console.log(`[ML API] Found ${products.length} products for "${query}"`)

    return NextResponse.json({
      products,
      total: data.paging.total,
      cached: false,
      source: "mercadolibre"
    })
  } catch (error) {
    console.error("[ML API] Error searching products:", error)
    return NextResponse.json(
      {
        error: "Error searching products",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

/**
 * Clear cache (for testing/admin)
 */
export async function DELETE() {
  searchCache.clear()
  return NextResponse.json({ message: "Cache cleared" })
}

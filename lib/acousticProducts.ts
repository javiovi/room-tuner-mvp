// Acoustic Products Database with Real Pricing
// Prices updated as of 2025 - USD and ARS

export interface AcousticProduct {
  id: string
  name: string
  category: 'absorber' | 'bass_trap' | 'diffuser' | 'rug' | 'curtain' | 'misc'
  priceUSD: number
  priceARS: number
  supplier: string
  link: string       // Amazon / manufacturer link (for EN)
  linkML: string     // MercadoLibre search URL (for ES)
  absorptionCoefficient?: number     // At 1kHz
  coverage?: number                  // m² per unit
  thickness?: number                 // cm
  installation: 'easy' | 'moderate' | 'professional'
  description: string
}

export const acousticProductsDB: AcousticProduct[] = [
  // ===== ABSORBERS =====
  {
    id: 'foam-panel-5cm',
    name: 'Acoustic Foam Panel 60x60cm (5cm)',
    category: 'absorber',
    priceUSD: 12,
    priceARS: 12000,
    supplier: 'Amazon / MercadoLibre',
    link: 'https://www.amazon.com/s?k=acoustic+foam+panels',
    linkML: 'https://www.mercadolibre.com.ar/search?q=panel+espuma+acustica+5cm',
    absorptionCoefficient: 0.65,
    coverage: 0.36,
    thickness: 5,
    installation: 'easy',
    description: 'Basic foam panel for mid-high frequency absorption. Good for first reflections and flutter echo.'
  },
  {
    id: 'foam-panel-10cm',
    name: 'Acoustic Foam Panel 60x60cm (10cm)',
    category: 'absorber',
    priceUSD: 18,
    priceARS: 18000,
    supplier: 'Amazon / MercadoLibre',
    link: 'https://www.amazon.com/s?k=thick+acoustic+foam',
    linkML: 'https://www.mercadolibre.com.ar/search?q=panel+espuma+acustica+10cm',
    absorptionCoefficient: 0.80,
    coverage: 0.36,
    thickness: 10,
    installation: 'easy',
    description: 'Thicker foam for better mid-frequency absorption. More effective than 5cm panels.'
  },
  {
    id: 'pro-fabric-panel-5cm',
    name: 'Fabric-Wrapped Panel 60x120cm (5cm)',
    category: 'absorber',
    priceUSD: 45,
    priceARS: 45000,
    supplier: 'ATS Acoustics / Local',
    link: 'https://www.atsacoustics.com/',
    linkML: 'https://www.mercadolibre.com.ar/search?q=panel+acustico+fibra+vidrio+tela',
    absorptionCoefficient: 0.85,
    coverage: 0.72,
    thickness: 5,
    installation: 'moderate',
    description: 'Professional fabric-wrapped fiberglass panel. Better aesthetics and performance than foam.'
  },
  {
    id: 'pro-fabric-panel-10cm',
    name: 'Fabric-Wrapped Panel 60x120cm (10cm)',
    category: 'absorber',
    priceUSD: 85,
    priceARS: 85000,
    supplier: 'GIK Acoustics / ATS',
    link: 'https://www.gikacoustics.com/',
    linkML: 'https://www.mercadolibre.com.ar/search?q=panel+acustico+profesional+10cm',
    absorptionCoefficient: 0.95,
    coverage: 0.72,
    thickness: 10,
    installation: 'moderate',
    description: 'High-performance broadband absorber. Excellent for critical listening environments.'
  },
  {
    id: 'ceiling-cloud-panel',
    name: 'Ceiling Cloud Panel 120x120cm (10cm)',
    category: 'absorber',
    priceUSD: 120,
    priceARS: 120000,
    supplier: 'Acoustics First',
    link: 'https://www.acousticsfirst.com/',
    linkML: 'https://www.mercadolibre.com.ar/search?q=panel+acustico+techo+cloud',
    absorptionCoefficient: 0.95,
    coverage: 1.44,
    thickness: 10,
    installation: 'professional',
    description: 'Large ceiling-mounted panel for overhead reflection control.'
  },

  // ===== BASS TRAPS =====
  {
    id: 'corner-bass-trap-60cm',
    name: 'Corner Bass Trap 30x30x60cm',
    category: 'bass_trap',
    priceUSD: 65,
    priceARS: 65000,
    supplier: 'GIK Acoustics / Primacoustic',
    link: 'https://www.gikacoustics.com/product/gik-acoustics-tri-trap/',
    linkML: 'https://www.mercadolibre.com.ar/search?q=trampa+graves+esquina+acustica',
    absorptionCoefficient: 0.75,
    installation: 'moderate',
    description: 'Corner-mounted bass trap for low frequency control. Treats problematic room modes.'
  },
  {
    id: 'corner-bass-trap-120cm',
    name: 'Corner Bass Trap 30x30x120cm',
    category: 'bass_trap',
    priceUSD: 120,
    priceARS: 120000,
    supplier: 'GIK Acoustics',
    link: 'https://www.gikacoustics.com/',
    linkML: 'https://www.mercadolibre.com.ar/search?q=bass+trap+esquina+120cm',
    absorptionCoefficient: 0.85,
    installation: 'moderate',
    description: 'Full-height corner bass trap. Maximum low-frequency absorption for serious rooms.'
  },
  {
    id: 'soffit-bass-trap',
    name: 'Soffit Bass Trap 60x60x30cm',
    category: 'bass_trap',
    priceUSD: 95,
    priceARS: 95000,
    supplier: 'GIK Acoustics / Real Traps',
    link: 'https://www.gikacoustics.com/',
    linkML: 'https://www.mercadolibre.com.ar/search?q=trampa+graves+soffit+acustico',
    absorptionCoefficient: 0.90,
    installation: 'moderate',
    description: 'Wall-ceiling junction trap. Treats bass buildup at boundaries.'
  },
  {
    id: 'membrane-bass-trap',
    name: 'Membrane Bass Trap 60x120cm',
    category: 'bass_trap',
    priceUSD: 180,
    priceARS: 180000,
    supplier: 'GIK Acoustics / Artnovion',
    link: 'https://www.gikacoustics.com/product/gik-acoustics-monster-bass-trap-flexrange-technology/',
    linkML: 'https://www.mercadolibre.com.ar/search?q=absorber+membrana+graves+acustico',
    absorptionCoefficient: 0.95,
    installation: 'professional',
    description: 'Tuned membrane absorber for specific low frequencies. Professional-grade solution.'
  },

  // ===== DIFFUSERS =====
  {
    id: 'qrd-diffuser-small',
    name: 'QRD Diffuser 60x60cm',
    category: 'diffuser',
    priceUSD: 85,
    priceARS: 85000,
    supplier: 'Acoustics First / Vicoustic',
    link: 'https://www.acousticsfirst.com/',
    linkML: 'https://www.mercadolibre.com.ar/search?q=difusor+acustico+QRD',
    installation: 'moderate',
    description: 'Quadratic residue diffuser. Scatters sound evenly without absorbing energy.'
  },
  {
    id: 'qrd-diffuser-large',
    name: 'QRD Diffuser 60x120cm',
    category: 'diffuser',
    priceUSD: 140,
    priceARS: 140000,
    supplier: 'Acoustics First / RPG',
    link: 'https://www.rpgacoustic.com/',
    linkML: 'https://www.mercadolibre.com.ar/search?q=difusor+acustico+grande',
    installation: 'moderate',
    description: 'Large diffuser for rear wall. Creates spacious, natural sound field.'
  },
  {
    id: 'skyline-diffuser',
    name: 'Skyline Diffuser 60x60cm',
    category: 'diffuser',
    priceUSD: 95,
    priceARS: 95000,
    supplier: 'Acoustics First / DIY',
    link: 'https://www.acousticsfirst.com/',
    linkML: 'https://www.mercadolibre.com.ar/search?q=difusor+skyline+acustico',
    installation: 'moderate',
    description: '2D diffuser with multi-directional scattering. Great for mixing positions.'
  },
  {
    id: 'poly-diffuser',
    name: 'Poly Cylindrical Diffuser 60x60cm',
    category: 'diffuser',
    priceUSD: 110,
    priceARS: 110000,
    supplier: 'Vicoustic / RPG',
    link: 'https://www.vicoustic.com/',
    linkML: 'https://www.mercadolibre.com.ar/search?q=difusor+acustico+cilindrico',
    installation: 'moderate',
    description: 'Curved poly diffuser. Broadband diffusion with modern aesthetics.'
  },

  // ===== RUGS & CARPETS =====
  {
    id: 'thick-rug-small',
    name: 'Thick Area Rug 1.5x2m',
    category: 'rug',
    priceUSD: 80,
    priceARS: 80000,
    supplier: 'IKEA / Local stores',
    link: 'https://www.amazon.com/s?k=thick+area+rug+5x7',
    linkML: 'https://www.mercadolibre.com.ar/search?q=alfombra+pelo+grueso+1.5x2',
    absorptionCoefficient: 0.30,
    coverage: 3,
    installation: 'easy',
    description: 'Medium pile rug for small rooms. Reduces floor reflections.'
  },
  {
    id: 'thick-rug-medium',
    name: 'Thick Area Rug 2x3m',
    category: 'rug',
    priceUSD: 150,
    priceARS: 150000,
    supplier: 'IKEA / Local stores',
    link: 'https://www.amazon.com/s?k=thick+area+rug+8x10',
    linkML: 'https://www.mercadolibre.com.ar/search?q=alfombra+pelo+grueso+2x3',
    absorptionCoefficient: 0.35,
    coverage: 6,
    installation: 'easy',
    description: 'Large thick pile rug. Essential for first reflection point between speakers and listener.'
  },
  {
    id: 'thick-rug-large',
    name: 'Thick Area Rug 3x4m',
    category: 'rug',
    priceUSD: 280,
    priceARS: 280000,
    supplier: 'Specialty carpet stores',
    link: 'https://www.amazon.com/s?k=thick+area+rug+10x13',
    linkML: 'https://www.mercadolibre.com.ar/search?q=alfombra+gruesa+grande+3x4',
    absorptionCoefficient: 0.40,
    coverage: 12,
    installation: 'easy',
    description: 'Extra large rug for comprehensive floor treatment in bigger rooms.'
  },

  // ===== CURTAINS =====
  {
    id: 'light-curtain',
    name: 'Light Curtain Fabric (per m²)',
    category: 'curtain',
    priceUSD: 15,
    priceARS: 15000,
    supplier: 'Local fabric stores',
    link: 'https://www.amazon.com/s?k=light+curtain+fabric',
    linkML: 'https://www.mercadolibre.com.ar/search?q=cortina+liviana+tela',
    absorptionCoefficient: 0.25,
    installation: 'easy',
    description: 'Light fabric curtain. Basic window treatment for high-frequency control.'
  },
  {
    id: 'medium-curtain',
    name: 'Medium Weight Curtain (per m²)',
    category: 'curtain',
    priceUSD: 25,
    priceARS: 25000,
    supplier: 'Local fabric stores',
    link: 'https://www.amazon.com/s?k=medium+weight+curtain',
    linkML: 'https://www.mercadolibre.com.ar/search?q=cortina+gruesa+blackout',
    absorptionCoefficient: 0.40,
    installation: 'easy',
    description: 'Heavier curtain fabric. Better absorption across frequency range.'
  },
  {
    id: 'heavy-curtain',
    name: 'Heavy Acoustic Curtain (per m²)',
    category: 'curtain',
    priceUSD: 40,
    priceARS: 40000,
    supplier: 'Acoustic specialty stores',
    link: 'https://www.amazon.com/s?k=heavy+acoustic+curtain',
    linkML: 'https://www.mercadolibre.com.ar/search?q=cortina+acustica+pesada',
    absorptionCoefficient: 0.55,
    installation: 'easy',
    description: 'Multi-layer acoustic curtain. Excellent for window and door treatment.'
  },
  {
    id: 'blackout-acoustic-curtain',
    name: 'Blackout Acoustic Curtain (per m²)',
    category: 'curtain',
    priceUSD: 55,
    priceARS: 55000,
    supplier: 'Acoustic specialty stores',
    link: 'https://www.amazon.com/s?k=blackout+acoustic+curtain',
    linkML: 'https://www.mercadolibre.com.ar/search?q=cortina+blackout+acustica',
    absorptionCoefficient: 0.65,
    installation: 'easy',
    description: 'Premium curtain with blackout and acoustic properties. Blocks light and sound.'
  },

  // ===== MISCELLANEOUS =====
  {
    id: 'door-seal-kit',
    name: 'Door Seal Kit (weatherstripping)',
    category: 'misc',
    priceUSD: 25,
    priceARS: 25000,
    supplier: 'Hardware stores',
    link: 'https://www.amazon.com/s?k=door+seal+kit+weatherstripping',
    linkML: 'https://www.mercadolibre.com.ar/search?q=burletes+puerta+antiruido',
    installation: 'easy',
    description: 'Rubber seal for door gaps. Reduces sound leakage and external noise.'
  },
  {
    id: 'window-plug',
    name: 'Window Plug Insert (custom size)',
    category: 'misc',
    priceUSD: 60,
    priceARS: 60000,
    supplier: 'DIY / Custom',
    link: 'https://www.amazon.com/s?k=window+plug+soundproof+insert',
    linkML: 'https://www.mercadolibre.com.ar/search?q=panel+ventana+aislante+acustico',
    absorptionCoefficient: 0.80,
    installation: 'moderate',
    description: 'Removable insulated plug for windows. Dramatically reduces noise when needed.'
  },
  {
    id: 'isolation-pads',
    name: 'Speaker Isolation Pads (pair)',
    category: 'misc',
    priceUSD: 35,
    priceARS: 35000,
    supplier: 'Amazon / Music stores',
    link: 'https://www.amazon.com/s?k=speaker+isolation+pads',
    linkML: 'https://www.mercadolibre.com.ar/search?q=pads+aislacion+monitores',
    installation: 'easy',
    description: 'Foam/rubber pads to decouple speakers from surfaces. Tightens bass response.'
  },
  {
    id: 'bass-shaker',
    name: 'Bass Shaker / Tactile Transducer',
    category: 'misc',
    priceUSD: 50,
    priceARS: 50000,
    supplier: 'Music/Audio stores',
    link: 'https://www.amazon.com/s?k=bass+shaker',
    linkML: 'https://www.mercadolibre.com.ar/search?q=bass+shaker+transductor',
    installation: 'moderate',
    description: 'Adds tactile bass feel without acoustic bass problems. Mounts to furniture.'
  },
  {
    id: 'measurement-mic',
    name: 'USB Measurement Microphone',
    category: 'misc',
    priceUSD: 80,
    priceARS: 80000,
    supplier: 'Amazon / MiniDSP',
    link: 'https://www.minidsp.com/products/acoustic-measurement/umik-1',
    linkML: 'https://www.mercadolibre.com.ar/search?q=microfono+medicion+acustica+USB',
    installation: 'easy',
    description: 'Calibrated mic for room measurements. Use with REW software to measure actual performance.'
  },
  {
    id: 'acoustic-caulk',
    name: 'Acoustic Sealant (tube)',
    category: 'misc',
    priceUSD: 12,
    priceARS: 12000,
    supplier: 'Hardware stores',
    link: 'https://www.amazon.com/s?k=acoustic+sealant+caulk',
    linkML: 'https://www.mercadolibre.com.ar/search?q=sellador+acustico+flexible',
    installation: 'easy',
    description: 'Flexible sealant for gaps and cracks. Prevents sound leaks through small openings.'
  },
  {
    id: 'mass-loaded-vinyl',
    name: 'Mass Loaded Vinyl (per m²)',
    category: 'misc',
    priceUSD: 35,
    priceARS: 35000,
    supplier: 'Acoustic specialty stores',
    link: 'https://www.amazon.com/s?k=mass+loaded+vinyl+soundproofing',
    linkML: 'https://www.mercadolibre.com.ar/search?q=vinilo+cargado+masa+acustico',
    installation: 'professional',
    description: 'Heavy vinyl barrier for soundproofing walls. Blocks sound transmission.'
  },
]

// ===== HELPER FUNCTIONS =====

export function getProductsByCategory(category: AcousticProduct['category']): AcousticProduct[] {
  return acousticProductsDB.filter(p => p.category === category)
}

export function getProductById(id: string): AcousticProduct | undefined {
  return acousticProductsDB.find(p => p.id === id)
}

export function calculateTreatmentCost(
  products: { id: string; quantity: number }[],
  currency: 'USD' | 'ARS' = 'USD'
): number {
  return products.reduce((total, item) => {
    const product = getProductById(item.id)
    if (!product) return total
    const price = currency === 'USD' ? product.priceUSD : product.priceARS
    return total + price * item.quantity
  }, 0)
}

export function getTotalAbsorptionArea(products: { id: string; quantity: number }[]): number {
  return products.reduce((total, item) => {
    const product = getProductById(item.id)
    if (!product || !product.coverage) return total
    return total + product.coverage * item.quantity
  }, 0)
}

// ===== RECOMMENDATION ENGINE =====

export interface ProductRecommendation {
  productId: string
  quantity: number
  placement: string
  priority: 'high' | 'medium' | 'low'
  reason: string
}

/**
 * Generate product recommendations based on room size and character
 */
export function generateProductRecommendations(
  roomArea: number, // m²
  _roomVolume: number, // m³ (reserved for future use)
  roomCharacter: 'viva' | 'equilibrada' | 'seca',
  budget: 'free' | 'low' | 'advanced'
): ProductRecommendation[] {
  const recommendations: ProductRecommendation[] = []

  // Free/DIY recommendations
  if (budget === 'free') {
    recommendations.push({
      productId: 'thick-rug-medium',
      quantity: 1,
      placement: 'Between speakers and listening position',
      priority: 'high',
      reason: 'Reduces floor reflections and flutter echo'
    })
    recommendations.push({
      productId: 'light-curtain',
      quantity: Math.ceil(roomArea * 0.15), // Approx window coverage
      placement: 'Windows and glass surfaces',
      priority: 'medium',
      reason: 'Controls window reflections'
    })
  }

  // Low budget recommendations
  if (budget === 'low') {
    const panelCount = Math.ceil(roomArea / 3) // Rough estimate: 1 panel per 3m² of floor

    recommendations.push({
      productId: 'foam-panel-5cm',
      quantity: Math.min(panelCount, 12), // Cap at 12 panels
      placement: 'First reflection points on side walls',
      priority: 'high',
      reason: 'Treats early reflections and reduces flutter echo'
    })

    if (roomCharacter === 'viva') {
      recommendations.push({
        productId: 'corner-bass-trap-60cm',
        quantity: 4,
        placement: 'All four corners of the room',
        priority: 'high',
        reason: 'Tames excessive bass and room modes'
      })
    }

    recommendations.push({
      productId: 'thick-rug-medium',
      quantity: 1,
      placement: 'Floor between speakers and listening position',
      priority: 'high',
      reason: 'Critical floor reflection point'
    })

    recommendations.push({
      productId: 'isolation-pads',
      quantity: 1,
      placement: 'Under speakers',
      priority: 'medium',
      reason: 'Decouples speakers from surface, tightens bass'
    })
  }

  // Advanced recommendations
  if (budget === 'advanced') {
    const wallPanels = Math.ceil(roomArea / 2.5)

    recommendations.push({
      productId: 'pro-fabric-panel-10cm',
      quantity: Math.min(wallPanels, 16),
      placement: 'First reflection points and front wall',
      priority: 'high',
      reason: 'Professional broadband absorption for accurate sound'
    })

    recommendations.push({
      productId: 'corner-bass-trap-120cm',
      quantity: 4,
      placement: 'Floor-to-ceiling in all corners',
      priority: 'high',
      reason: 'Maximum low-frequency control'
    })

    if (roomCharacter !== 'seca') {
      recommendations.push({
        productId: 'qrd-diffuser-large',
        quantity: Math.ceil(roomArea / 12),
        placement: 'Rear wall behind listening position',
        priority: 'medium',
        reason: 'Creates natural spaciousness without over-damping'
      })
    }

    recommendations.push({
      productId: 'ceiling-cloud-panel',
      quantity: Math.ceil(roomArea / 10),
      placement: 'Ceiling between speakers and listener',
      priority: 'medium',
      reason: 'Controls ceiling reflections'
    })

    recommendations.push({
      productId: 'measurement-mic',
      quantity: 1,
      placement: 'For room analysis',
      priority: 'medium',
      reason: 'Measure and verify improvements with REW software'
    })
  }

  return recommendations
}

import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { ReportPDFDocument } from '@/components/report/pdf/ReportPDFDocument'
import type { RoomProject, EnhancedAnalysisResponse } from '@/app/types/room'

// Vercel serverless function config
export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds max execution

/**
 * PDF Generation API
 * Renders the room analysis report as a downloadable PDF
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { project, analysis } = body as {
      project: RoomProject
      analysis: EnhancedAnalysisResponse
    }

    // Validate required data
    if (!project || !analysis) {
      return NextResponse.json(
        { error: 'Missing project or analysis data' },
        { status: 400 }
      )
    }

    console.log('[PDF] Starting PDF generation...')

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `roomtuner-reporte-${timestamp}.pdf`

    // Render PDF document using renderToBuffer (better for serverless)
    const buffer = await renderToBuffer(
      ReportPDFDocument({ project, analysis })
    )

    console.log('[PDF] PDF generated successfully, size:', buffer.length, 'bytes')

    // Return PDF as downloadable file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('[PDF Generation] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

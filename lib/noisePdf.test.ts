import { expect, it } from 'vitest'
import { renderToBuffer } from '@react-pdf/renderer'
import { ReportPDFDocument } from '@/components/report/pdf/ReportPDFDocument'
import { mockAnalysis, mockProject } from './mockData'
import { generatePdfRequestSchema } from './validation/schemas'

it('exports the external-noise branch and an unable result through the real PDF renderer', async () => {
  const request = generatePdfRequestSchema.parse({
    project: {...mockProject,goal:'work',concern:'noise',noiseSource:'outside',noiseEntry:'window'},
    analysis:mockAnalysis,locale:'es',personalization:{experiments:{windowClose:{tried:false,outcome:'unable',note:'La ventana no abre'}}},
  })
  const bytes = await renderToBuffer(ReportPDFDocument({...request,locale:request.locale ?? 'es'}))
  expect(bytes.subarray(0,4).toString()).toBe('%PDF')
  expect(bytes.byteLength).toBeGreaterThan(1000)
})

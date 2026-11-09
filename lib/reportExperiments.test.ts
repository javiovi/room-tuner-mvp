import { expect, it } from 'vitest'
import { getReportExperiments, experimentCatalog } from './reportExperiments'
import { es } from './translations/es'
import { reportPersonalizationSchema } from './validation/schemas'
it('does not recommend moving fixed objects or textiles for a bass-only concern', () => {
  expect(getReportExperiments({goal:'music',concern:'bass',moveConstraints:{speakers:false,listening:false,furniture:false}},'viva',es.experiments)).toEqual([])
  expect(getReportExperiments({goal:'music',concern:'bass',moveConstraints:{speakers:true,listening:false,furniture:true}},'viva',es.experiments)).toEqual([])
})
it('keeps noise and echo advice focused on the stated concern', () => {
  expect(getReportExperiments({goal:'music',concern:'noise'},'viva',es.experiments).map(x=>x.id)).toEqual(['quiet'])
  expect(getReportExperiments({goal:'work',concern:'echo'},'seca',es.experiments).map(x=>x.id)).toEqual(['echo'])
})
it('retains catalog entries for old records after movement restrictions change', () => {
  expect(experimentCatalog(es.experiments).map(x=>x.id)).toContain('symmetry')
  expect(reportPersonalizationSchema.safeParse({experiments:{symmetry:{tried:false,outcome:'unable',note:'No puedo moverlo'}}}).success).toBe(true)
})

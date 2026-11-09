import { expect, it } from 'vitest'
import { getReportExperiments, experimentCatalog } from './reportExperiments'
import { es } from './translations/es'
import { reportPersonalizationSchema } from './validation/schemas'
it('does not recommend moving fixed objects or textiles for a bass-only concern', () => {
  expect(getReportExperiments({goal:'music',concern:'bass',moveConstraints:{speakers:false,listening:false,furniture:false}},'viva',es.experiments)).toEqual([])
  expect(getReportExperiments({goal:'music',concern:'bass',moveConstraints:{speakers:true,listening:false,furniture:true}},'viva',es.experiments)).toEqual([])
})
it('keeps noise and echo advice focused on the stated concern', () => {
  expect(getReportExperiments({goal:'music',concern:'noise',noiseSource:'inside'},'viva',es.experiments).map(x=>x.id)).toEqual(['quiet'])
  expect(getReportExperiments({goal:'work',concern:'echo'},'seca',es.experiments).map(x=>x.id)).toEqual(['echo'])
})
it('retains catalog entries for old records after movement restrictions change', () => {
  expect(experimentCatalog(es.experiments).map(x=>x.id)).toContain('symmetry')
  expect(reportPersonalizationSchema.safeParse({experiments:{symmetry:{tried:false,outcome:'unable',note:'No puedo moverlo'}}}).success).toBe(true)
})

it('uses an opening-specific action for external noise and never tells the user to pause traffic', () => {
  expect(getReportExperiments({goal:'work',concern:'noise',noiseSource:'outside',noiseEntry:'window'},'viva',es.experiments).map(x=>x.id)).toEqual(['windowClose','quietSpot'])
  expect(getReportExperiments({goal:'work',concern:'noise',noiseSource:'neighbors',noiseEntry:'wall',moveConstraints:{listening:false,speakers:false,furniture:false}},'viva',es.experiments).map(x=>x.id)).toEqual(['noisePath'])
})

import { noiseGuidance } from './noiseGuidance'
it('does not sell seals for structural noise or unknown paths', () => {
  const structural = noiseGuidance({goal:'work',noiseSource:'neighbors',noiseEntry:'wall'},es.noise)
  expect(structural).toHaveLength(1)
  expect(structural[0].body).toBe(es.noise.wallAdvice)
  expect(noiseGuidance({goal:'work',noiseSource:'outside',noiseEntry:'window'},es.noise)[1].body).toContain(es.noise.sealWhen)
})

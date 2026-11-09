import type { RoomProject } from '@/app/types/room'
import type { Translations } from '@/lib/translations/es'

/** Conditional options, shared by the interface and PDF. No estimate of isolation. */
export function noiseGuidance(project: RoomProject, c: Translations['noise']) {
  if (project.noiseSource === 'inside') return []
  if (project.noiseEntry !== 'window' && project.noiseEntry !== 'door') {
    return [{ title: c.when, body: project.noiseEntry === 'wall' ? c.wallAdvice : c.unknownAdvice }]
  }
  return [
    { title: c.free, body: c.freeAdvice },
    { title: c.budget, body: `${c.sealWhen} ${c.sealAdvice}` },
    { title: c.work, body: project.noiseEntry === 'window' ? c.workAdvice : c.doorWorkAdvice },
  ]
}

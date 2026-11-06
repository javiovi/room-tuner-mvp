import { expect, it, vi } from 'vitest'
const db = vi.hoisted(() => ({ from: vi.fn(), select: vi.fn(), eq: vi.fn(), returns: vi.fn(), single: vi.fn() }))
vi.mock('@/lib/supabase/client', () => ({ createServerClient: () => db }))
import { GET } from './route'
import { roomProjectSchema } from '@/lib/validation/schemas'

it('restores optional answers without nulls that would block PDF export', async () => {
  for (const method of [db.from, db.select, db.eq, db.returns]) method.mockReturnValue(db)
  db.single.mockResolvedValueOnce({ data: { goal: 'work', floor_type: null, wall_type: null, speaker_placement: null, listening_position: null }, error: null })
    .mockResolvedValueOnce({ data: { recommendations: { inputContext: { concern: 'noise', dimensionSource: 'approximate', moveConstraints: { speakers: false, listening: true, furniture: false } } }, room_metrics: {}, created_at: '2026-11-06' }, error: null })
  const response = await GET(new Request('http://localhost'), { params: Promise.resolve({ id: 'test' }) })
  expect(response.status).toBe(200)
  const { project } = await response.json()
  expect(roomProjectSchema.safeParse(project).success).toBe(true)
  expect(project.concern).toBe('noise')
  expect(project.moveConstraints.speakers).toBe(false)
  expect(project).not.toHaveProperty('speakerPlacement')
})

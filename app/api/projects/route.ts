// API Route: Projects CRUD
// Handle creating, reading, updating, and deleting room projects

import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'

// GET /api/projects - List all projects for current user
export async function GET(request: Request) {
  try {
    const supabase = createServerClient()

    // For MVP without auth, query all projects (user_id is null)
    // TODO: Filter by auth.uid() when auth is implemented

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .is('user_id', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create new project
export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    // For MVP without auth, user_id is null
    // TODO: Set to auth.uid() when auth is implemented

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: null,
        name: body.name || 'Mi Espacio',
        goal: body.goal,
        length_m: body.lengthM,
        width_m: body.widthM,
        height_m: body.heightM,
        floor_type: body.floorType,
        wall_type: body.wallType,
        speaker_placement: body.speakerPlacement,
        listening_position: body.listeningPosition,
        furniture: body.furniture || [],
        noise_measurement: body.noiseMeasurement,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

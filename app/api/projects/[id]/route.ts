import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/client"
import type { Database, Json } from "@/lib/supabase/database.types"
import type { RoomProject, EnhancedAnalysisResponse } from "@/app/types/room"

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"]
type AnalysisRow = Database["public"]["Tables"]["analyses"]["Row"]

// Read-only by design: no auth/ownership system exists yet, so this only exposes
// non-destructive reads by unguessable UUID (a "shareable link" model). The
// mutating endpoints that used to live here (PUT/DELETE with no ownership check)
// were removed as an IDOR fix — do not reintroduce them without auth in front.
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    const supabase = createServerClient()

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select()
      .eq("id", id)
      .returns<ProjectRow[]>()
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const { data: analysisRow, error: analysisError } = await supabase
      .from("analyses")
      .select()
      .eq("project_id", id)
      .returns<AnalysisRow[]>()
      .single()

    if (analysisError || !analysisRow) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    return NextResponse.json({
      project: mapProjectRow(project),
      analysis: mapAnalysisRow(analysisRow),
    })
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function mapProjectRow(row: ProjectRow): RoomProject {
  return {
    goal: row.goal,
    lengthM: row.length_m ?? undefined,
    widthM: row.width_m ?? undefined,
    heightM: row.height_m ?? undefined,
    floorType: row.floor_type as RoomProject["floorType"],
    wallType: row.wall_type as RoomProject["wallType"],
    speakerPlacement: row.speaker_placement as RoomProject["speakerPlacement"],
    listeningPosition: row.listening_position as RoomProject["listeningPosition"],
    furniture: (row.furniture as string[] | null) ?? [],
    noiseMeasurement: (row.noise_measurement as RoomProject["noiseMeasurement"] | null) ?? undefined,
  }
}

function mapAnalysisRow(row: AnalysisRow): EnhancedAnalysisResponse {
  const recommendations = (row.recommendations ?? {}) as Record<string, Json>
  const roomMetrics = row.room_metrics as unknown as EnhancedAnalysisResponse["roomMetrics"]

  return {
    summary: row.summary ?? "",
    roomCharacter: row.room_character ?? "equilibrada",
    priorityScore: row.priority_score as unknown as EnhancedAnalysisResponse["priorityScore"],
    roomMetrics,
    // Saved inside `recommendations` (not its own column) to avoid a schema migration;
    // older rows predating this field fall back to a zeroed-out placeholder.
    materialsAnalysis:
      (recommendations.materialsAnalysis as unknown as EnhancedAnalysisResponse["materialsAnalysis"]) ?? {
        floorAbsorption: 0,
        wallAbsorption: 0,
        ceilingAbsorption: 0,
        furnitureContribution: 0,
        totalAbsorption: roomMetrics?.totalAbsorption ?? 0,
      },
    frequencyResponse: row.frequency_response as unknown as EnhancedAnalysisResponse["frequencyResponse"],
    freeChanges: recommendations.freeChanges as unknown as EnhancedAnalysisResponse["freeChanges"],
    lowBudgetChanges: recommendations.lowBudgetChanges as unknown as EnhancedAnalysisResponse["lowBudgetChanges"],
    advancedChanges: recommendations.advancedChanges as unknown as EnhancedAnalysisResponse["advancedChanges"],
    roomDiagram: row.room_diagram as unknown as EnhancedAnalysisResponse["roomDiagram"],
    generatedAt: row.created_at,
  }
}

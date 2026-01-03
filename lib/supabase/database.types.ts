// Database Types
// Generated from Supabase schema
// You can auto-generate this with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string | null
          name: string
          created_at: string
          updated_at: string
          goal: 'music' | 'instrument' | 'work' | null
          length_m: number | null
          width_m: number | null
          height_m: number | null
          floor_type: string | null
          wall_type: string | null
          speaker_placement: string | null
          listening_position: string | null
          furniture: Json
          noise_measurement: Json | null
          status: 'draft' | 'analyzing' | 'completed'
        }
        Insert: {
          id?: string
          user_id?: string | null
          name?: string
          created_at?: string
          updated_at?: string
          goal?: 'music' | 'instrument' | 'work' | null
          length_m?: number | null
          width_m?: number | null
          height_m?: number | null
          floor_type?: string | null
          wall_type?: string | null
          speaker_placement?: string | null
          listening_position?: string | null
          furniture?: Json
          noise_measurement?: Json | null
          status?: 'draft' | 'analyzing' | 'completed'
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          created_at?: string
          updated_at?: string
          goal?: 'music' | 'instrument' | 'work' | null
          length_m?: number | null
          width_m?: number | null
          height_m?: number | null
          floor_type?: string | null
          wall_type?: string | null
          speaker_placement?: string | null
          listening_position?: string | null
          furniture?: Json
          noise_measurement?: Json | null
          status?: 'draft' | 'analyzing' | 'completed'
        }
      }
      analyses: {
        Row: {
          id: string
          project_id: string
          created_at: string
          summary: string | null
          room_character: 'viva' | 'equilibrada' | 'seca' | null
          priority_score: Json | null
          room_metrics: Json | null
          frequency_response: Json | null
          recommendations: Json | null
          room_diagram: Json | null
          version: string
          calculation_time_ms: number | null
        }
        Insert: {
          id?: string
          project_id: string
          created_at?: string
          summary?: string | null
          room_character?: 'viva' | 'equilibrada' | 'seca' | null
          priority_score?: Json | null
          room_metrics?: Json | null
          frequency_response?: Json | null
          recommendations?: Json | null
          room_diagram?: Json | null
          version?: string
          calculation_time_ms?: number | null
        }
        Update: {
          id?: string
          project_id?: string
          created_at?: string
          summary?: string | null
          room_character?: 'viva' | 'equilibrada' | 'seca' | null
          priority_score?: Json | null
          room_metrics?: Json | null
          frequency_response?: Json | null
          recommendations?: Json | null
          room_diagram?: Json | null
          version?: string
          calculation_time_ms?: number | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          category: 'absorber' | 'bass_trap' | 'diffuser' | 'rug' | 'curtain' | 'misc'
          price_usd: number | null
          price_ars: number | null
          supplier: string | null
          link: string | null
          description: string | null
          absorption_coefficient: number | null
          coverage: number | null
          thickness: number | null
          installation_difficulty: 'easy' | 'moderate' | 'professional' | null
          last_price_update: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: 'absorber' | 'bass_trap' | 'diffuser' | 'rug' | 'curtain' | 'misc'
          price_usd?: number | null
          price_ars?: number | null
          supplier?: string | null
          link?: string | null
          description?: string | null
          absorption_coefficient?: number | null
          coverage?: number | null
          thickness?: number | null
          installation_difficulty?: 'easy' | 'moderate' | 'professional' | null
          last_price_update?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: 'absorber' | 'bass_trap' | 'diffuser' | 'rug' | 'curtain' | 'misc'
          price_usd?: number | null
          price_ars?: number | null
          supplier?: string | null
          link?: string | null
          description?: string | null
          absorption_coefficient?: number | null
          coverage?: number | null
          thickness?: number | null
          installation_difficulty?: 'easy' | 'moderate' | 'professional' | null
          last_price_update?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      measurements: {
        Row: {
          id: string
          project_id: string
          created_at: string
          measurement_type: 'camera_ar' | 'manual' | 'lidar'
          device_info: string | null
          dimensions: Json
          raw_data: Json | null
        }
        Insert: {
          id?: string
          project_id: string
          created_at?: string
          measurement_type: 'camera_ar' | 'manual' | 'lidar'
          device_info?: string | null
          dimensions: Json
          raw_data?: Json | null
        }
        Update: {
          id?: string
          project_id?: string
          created_at?: string
          measurement_type?: 'camera_ar' | 'manual' | 'lidar'
          device_info?: string | null
          dimensions?: Json
          raw_data?: Json | null
        }
      }
    }
  }
}

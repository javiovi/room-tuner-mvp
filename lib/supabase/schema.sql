-- RoomTuner Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROJECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Mi Sala',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Room goal
  goal TEXT CHECK (goal IN ('music', 'instrument', 'work')),

  -- Dimensions
  length_m DECIMAL(5,2),
  width_m DECIMAL(5,2),
  height_m DECIMAL(5,2),

  -- Materials
  floor_type TEXT,
  wall_type TEXT,

  -- Speaker/Listening placement
  speaker_placement TEXT,
  listening_position TEXT,

  -- Furniture (JSON array of strings)
  furniture JSONB DEFAULT '[]'::jsonb,

  -- Noise measurement
  noise_measurement JSONB,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'analyzing', 'completed')),

  -- Indexes
  CONSTRAINT projects_user_id_idx UNIQUE (user_id, id)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- =====================================================
-- ANALYSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Analysis results (stored as JSONB for flexibility)
  summary TEXT,
  room_character TEXT CHECK (room_character IN ('viva', 'equilibrada', 'seca')),
  priority_score JSONB,
  room_metrics JSONB,
  frequency_response JSONB,
  recommendations JSONB,
  room_diagram JSONB,

  -- Metadata
  version TEXT NOT NULL DEFAULT '1.0',
  calculation_time_ms INTEGER,

  -- Only one analysis per project (for MVP)
  CONSTRAINT analyses_project_id_unique UNIQUE (project_id)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_analyses_project_id ON public.analyses(project_id);

-- =====================================================
-- PRODUCTS TABLE (Catalog)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('absorber', 'bass_trap', 'diffuser', 'rug', 'curtain', 'misc')),

  -- Pricing
  price_usd DECIMAL(10,2),
  price_ars DECIMAL(10,2),

  -- Product info
  supplier TEXT,
  link TEXT,
  description TEXT,

  -- Acoustic properties
  absorption_coefficient DECIMAL(3,2),
  coverage DECIMAL(5,2), -- m² per unit
  thickness DECIMAL(4,1), -- cm

  -- Installation
  installation_difficulty TEXT CHECK (installation_difficulty IN ('easy', 'moderate', 'professional')),

  -- Metadata
  last_price_update TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);

-- =====================================================
-- MEASUREMENTS TABLE (AR Camera measurements)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Measurement metadata
  measurement_type TEXT NOT NULL CHECK (measurement_type IN ('camera_ar', 'manual', 'lidar')),
  device_info TEXT,

  -- Dimensions with confidence
  dimensions JSONB NOT NULL, -- {length, width, height, confidence}

  -- Raw sensor data (for debugging/improvements)
  raw_data JSONB
);

-- Add index
CREATE INDEX IF NOT EXISTS idx_measurements_project_id ON public.measurements(project_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- PROJECTS: Users can only see/modify their own projects
CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- ANALYSES: Users can only see analyses of their own projects
CREATE POLICY "Users can view own analyses"
  ON public.analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = analyses.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own analyses"
  ON public.analyses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = analyses.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own analyses"
  ON public.analyses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = analyses.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- MEASUREMENTS: Users can only see measurements of their own projects
CREATE POLICY "Users can view own measurements"
  ON public.measurements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = measurements.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own measurements"
  ON public.measurements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = measurements.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- PRODUCTS: Everyone can read products (public catalog)
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (active = TRUE);

-- Only service role can modify products (via API)
-- No public insert/update/delete policies needed

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SEED DATA: Insert initial products
-- =====================================================

INSERT INTO public.products (name, category, price_usd, price_ars, supplier, link, absorption_coefficient, coverage, thickness, installation_difficulty, description, active, last_price_update)
VALUES
  -- Absorbers
  ('Acoustic Foam Panel 60x60cm (5cm)', 'absorber', 12, 12000, 'MercadoLibre', 'https://mercadolibre.com.ar', 0.65, 0.36, 5, 'easy', 'Panel de espuma acústica básico para absorción de medios y altos', true, NOW()),
  ('Professional Acoustic Panel 60x120cm (10cm)', 'absorber', 85, 85000, 'Local', '', 0.95, 0.72, 10, 'moderate', 'Panel profesional de alta densidad para absorción broadband', true, NOW()),

  -- Bass Traps
  ('Corner Bass Trap 30x30x120cm', 'bass_trap', 120, 120000, 'Import', '', 0.85, 0, 30, 'moderate', 'Trampa de graves para esquinas, controla modos de baja frecuencia', true, NOW()),
  ('Superchunk Bass Trap (DIY Kit)', 'bass_trap', 45, 45000, 'Local', '', 0.75, 0, 0, 'moderate', 'Kit DIY para construir superchunk bass traps', true, NOW()),

  -- Diffusers
  ('QRD Diffuser Panel 60x60cm', 'diffuser', 95, 95000, 'Import', '', 0, 0.36, 10, 'moderate', 'Difusor QRD para dispersión de frecuencias medias-altas', true, NOW()),

  -- Rugs
  ('Thick Rug 2x3m', 'rug', 150, 150000, 'IKEA / Local', '', 0.35, 6, 0, 'easy', 'Alfombra gruesa para control de reflexiones de piso', true, NOW()),

  -- Curtains
  ('Heavy Acoustic Curtain (per m²)', 'curtain', 25, 25000, 'Fabric Store', '', 0.45, 1, 0, 'easy', 'Cortina acústica gruesa para ventanas', true, NOW())
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMPLETE!
-- =====================================================

-- Verify tables were created
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('projects', 'analyses', 'products', 'measurements')
ORDER BY table_name;

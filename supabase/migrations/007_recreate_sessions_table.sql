-- Drop the old sessions table
DROP TABLE IF EXISTS sessions CASCADE;

-- Create new sessions table with updated structure
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  business TEXT NOT NULL CHECK (business IN ('halo', 'soul')),
  service_type TEXT NOT NULL CHECK (service_type IN ('massage', 'deep-tissue', 'advanced-bodywork')),
  duration INTEGER NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  deeptissue_lymp_sport DECIMAL(10, 2) NOT NULL DEFAULT 0,
  advanced_bodywork DECIMAL(10, 2) NOT NULL DEFAULT 0,
  add_ons DECIMAL(10, 2) NOT NULL DEFAULT 0,
  review DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tips DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_payout DECIMAL(10, 2),
  closed_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add check constraint to ensure only one surcharge type per session
ALTER TABLE sessions ADD CONSTRAINT check_single_surcharge_type
  CHECK (NOT (deeptissue_lymp_sport > 0 AND advanced_bodywork > 0));

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS sessions_date_business_idx ON sessions(date, business);
CREATE INDEX IF NOT EXISTS sessions_service_type_idx ON sessions(service_type);
CREATE INDEX IF NOT EXISTS sessions_created_at_idx ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS sessions_closed_date_idx ON sessions(closed_date);

-- Enable Row Level Security (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Allow all operations for development
CREATE POLICY "Allow all operations" ON sessions
  FOR ALL USING (true)
  WITH CHECK (true);

-- Add comments for clarity
COMMENT ON TABLE sessions IS 'Earnings tracker sessions for massage therapists';
COMMENT ON COLUMN sessions.id IS 'Unique session identifier';
COMMENT ON COLUMN sessions.date IS 'Session date in YYYY-MM-DD format';
COMMENT ON COLUMN sessions.business IS 'Business location (halo or soul)';
COMMENT ON COLUMN sessions.service_type IS 'Type of massage service provided';
COMMENT ON COLUMN sessions.duration IS 'Session duration in minutes';
COMMENT ON COLUMN sessions.base_price IS 'Base massage payout (without surcharges)';
COMMENT ON COLUMN sessions.deeptissue_lymp_sport IS 'Deep Tissue/Lymphatic/Sports surcharge: $7.50';
COMMENT ON COLUMN sessions.advanced_bodywork IS 'Advanced Bodywork surcharge: $12.50';
COMMENT ON COLUMN sessions.add_ons IS 'Total value of add-ons (non-surcharge add-ons only)';
COMMENT ON COLUMN sessions.review IS 'Client review bonus (Halo only)';
COMMENT ON COLUMN sessions.tips IS 'Tips received';
COMMENT ON COLUMN sessions.total_payout IS 'Total payout for Halo sessions (base + surcharges + add-ons + review + tips)';
COMMENT ON COLUMN sessions.closed_date IS 'Date when this session''s day was closed out (NULL = day is open)';
COMMENT ON COLUMN sessions.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN sessions.updated_at IS 'Timestamp when record was last updated';

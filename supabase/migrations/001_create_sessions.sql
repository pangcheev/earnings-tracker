-- Create sessions table for earnings tracker
-- Each row = one individual massage session (NOT aggregated)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  business TEXT NOT NULL CHECK (business IN ('halo', 'soul')),
  service_type TEXT NOT NULL CHECK (service_type IN ('massage', 'deep-tissue', 'advanced-bodywork')),
  duration INTEGER NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  add_ons DECIMAL(10, 2) NOT NULL DEFAULT 0,
  review DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tips DECIMAL(10, 2) NOT NULL DEFAULT 0,
  halo_payout_amount DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by date and business
CREATE INDEX IF NOT EXISTS sessions_date_business_idx ON sessions(date, business);
CREATE INDEX IF NOT EXISTS sessions_service_type_idx ON sessions(service_type);
CREATE INDEX IF NOT EXISTS sessions_created_at_idx ON sessions(created_at DESC);

-- Enable Row Level Security (RLS) for public access in development
-- In production, replace with proper auth
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Allow all operations for development
-- ⚠️  IMPORTANT: In production, replace with proper auth policies
CREATE POLICY "Allow all operations" ON sessions
  FOR ALL USING (true)
  WITH CHECK (true);

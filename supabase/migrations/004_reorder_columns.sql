-- Reorder columns: move deep_tissue_surcharge and advanced_bodywork_surcharge after base_price
-- PostgreSQL doesn't support direct column reordering, so we recreate the table with the desired order

-- Step 1: Create new table with correct column order
CREATE TABLE sessions_new (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  business TEXT NOT NULL CHECK (business IN ('halo', 'soul')),
  service_type TEXT NOT NULL CHECK (service_type IN ('massage', 'deep-tissue', 'advanced-bodywork')),
  duration INTEGER NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  deep_tissue_surcharge DECIMAL(10, 2) DEFAULT 0,
  advanced_bodywork_surcharge DECIMAL(10, 2) DEFAULT 0,
  add_ons DECIMAL(10, 2) NOT NULL DEFAULT 0,
  review DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tips DECIMAL(10, 2) NOT NULL DEFAULT 0,
  halo_payout_amount DECIMAL(10, 2),
  closed_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Copy all data from old table
INSERT INTO sessions_new 
SELECT id, date, business, service_type, duration, base_price, deep_tissue_surcharge, 
       advanced_bodywork_surcharge, add_ons, review, tips, halo_payout_amount, 
       closed_date, created_at, updated_at
FROM sessions;

-- Step 3: Drop old table
DROP TABLE sessions CASCADE;

-- Step 4: Rename new table
ALTER TABLE sessions_new RENAME TO sessions;

-- Step 5: Recreate indices
CREATE INDEX IF NOT EXISTS sessions_date_business_idx ON sessions(date, business);
CREATE INDEX IF NOT EXISTS sessions_service_type_idx ON sessions(service_type);
CREATE INDEX IF NOT EXISTS sessions_created_at_idx ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS sessions_closed_date_idx ON sessions(closed_date);

-- Step 6: Recreate RLS and policies
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON sessions
  FOR ALL USING (true)
  WITH CHECK (true);

-- Step 7: Recreate check constraint
ALTER TABLE sessions ADD CONSTRAINT check_single_surcharge
  CHECK (
    CASE 
      WHEN service_type = 'deep-tissue' THEN (deep_tissue_surcharge = 7.50 AND advanced_bodywork_surcharge = 0)
      WHEN service_type = 'advanced-bodywork' THEN (deep_tissue_surcharge = 0 AND advanced_bodywork_surcharge = 12.50)
      ELSE (deep_tissue_surcharge = 0 AND advanced_bodywork_surcharge = 0)
    END
  );

-- Step 8: Add comments for clarity
COMMENT ON COLUMN sessions.deep_tissue_surcharge IS 'Surcharge for Deep Tissue/Lymphatic/Sports service type: $7.50';
COMMENT ON COLUMN sessions.advanced_bodywork_surcharge IS 'Surcharge for Advanced Bodywork service type: $12.50';

-- Reorder columns: move deep_tissue_surcharge and advanced_bodywork_surcharge after base_price
-- Preserves all existing data without table recreation

-- Step 1: Create temporary columns in the desired position (after base_price)
ALTER TABLE sessions 
  ADD COLUMN deep_tissue_surcharge_new DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN advanced_bodywork_surcharge_new DECIMAL(10, 2) DEFAULT 0;

-- Step 2: Copy data from old columns to new columns
UPDATE sessions 
SET deep_tissue_surcharge_new = deep_tissue_surcharge,
    advanced_bodywork_surcharge_new = advanced_bodywork_surcharge;

-- Step 3: Drop old columns
ALTER TABLE sessions 
  DROP COLUMN deep_tissue_surcharge,
  DROP COLUMN advanced_bodywork_surcharge;

-- Step 4: Rename new columns to original names
ALTER TABLE sessions 
  RENAME COLUMN deep_tissue_surcharge_new TO deep_tissue_surcharge;

ALTER TABLE sessions 
  RENAME COLUMN advanced_bodywork_surcharge_new TO advanced_bodywork_surcharge;

-- Step 5: Recreate check constraint
ALTER TABLE sessions ADD CONSTRAINT check_single_surcharge
  CHECK (
    CASE 
      WHEN service_type = 'deep-tissue' THEN (deep_tissue_surcharge = 7.50 AND advanced_bodywork_surcharge = 0)
      WHEN service_type = 'advanced-bodywork' THEN (deep_tissue_surcharge = 0 AND advanced_bodywork_surcharge = 12.50)
      ELSE (deep_tissue_surcharge = 0 AND advanced_bodywork_surcharge = 0)
    END
  );

-- Step 6: Add comments for clarity
COMMENT ON COLUMN sessions.deep_tissue_surcharge IS 'Surcharge for Deep Tissue/Lymphatic/Sports service type: $7.50';
COMMENT ON COLUMN sessions.advanced_bodywork_surcharge IS 'Surcharge for Advanced Bodywork service type: $12.50';

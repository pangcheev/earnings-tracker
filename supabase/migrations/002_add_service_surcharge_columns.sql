-- Add service surcharge tracking columns for better reporting
-- This helps separate base pricing from service type surcharges

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS deep_tissue_surcharge DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS advanced_bodywork_surcharge DECIMAL(10, 2) DEFAULT 0;

-- Add check constraint to ensure only one surcharge is applied per session
ALTER TABLE sessions ADD CONSTRAINT check_single_surcharge
  CHECK (
    CASE 
      WHEN service_type = 'deep-tissue' THEN (deep_tissue_surcharge = 7.50 AND advanced_bodywork_surcharge = 0)
      WHEN service_type = 'advanced-bodywork' THEN (deep_tissue_surcharge = 0 AND advanced_bodywork_surcharge = 12.50)
      ELSE (deep_tissue_surcharge = 0 AND advanced_bodywork_surcharge = 0)
    END
  );

-- Add comment for clarity
COMMENT ON COLUMN sessions.deep_tissue_surcharge IS 'Surcharge for Deep Tissue/Lymphatic/Sports service type: $7.50';
COMMENT ON COLUMN sessions.advanced_bodywork_surcharge IS 'Surcharge for Advanced Bodywork service type: $12.50';

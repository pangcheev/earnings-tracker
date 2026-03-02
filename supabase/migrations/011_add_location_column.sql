-- Add location column to sessions table with Halo as default

-- Add the location column if it doesn't exist
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS location VARCHAR(50) DEFAULT 'Halo';

-- Update any existing rows that don't have a location set
UPDATE sessions
SET location = 'Halo'
WHERE location IS NULL;

-- Add a constraint to ensure location is always set
ALTER TABLE sessions
ALTER COLUMN location SET NOT NULL;

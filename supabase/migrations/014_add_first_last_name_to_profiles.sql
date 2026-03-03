-- Add first_name and last_name columns to profiles table
ALTER TABLE profiles ADD COLUMN first_name TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN last_name TEXT DEFAULT '';

-- Migrate existing full_name data to first_name and last_name
-- Split on the first space if it exists, otherwise put all text in first_name
UPDATE profiles
SET 
  first_name = CASE 
    WHEN full_name IS NULL OR full_name = '' THEN ''
    WHEN position(' ' IN full_name) > 0 THEN substring(full_name FROM 1 FOR position(' ' IN full_name) - 1)
    ELSE full_name
  END,
  last_name = CASE 
    WHEN full_name IS NULL OR full_name = '' THEN ''
    WHEN position(' ' IN full_name) > 0 THEN substring(full_name FROM position(' ' IN full_name) + 1)
    ELSE ''
  END
WHERE full_name IS NOT NULL;

-- Add comment
COMMENT ON COLUMN profiles.first_name IS 'User first name';
COMMENT ON COLUMN profiles.last_name IS 'User last name';

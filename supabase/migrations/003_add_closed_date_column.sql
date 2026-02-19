-- Add closed_date column to track when a date is closed out
-- NULL = day is open, timestamp value = day is closed
ALTER TABLE sessions ADD COLUMN closed_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for faster lookups of closed days
CREATE INDEX IF NOT EXISTS sessions_closed_date_idx ON sessions(closed_date);

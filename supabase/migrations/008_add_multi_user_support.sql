-- Add user_id column to sessions table for multi-user support
ALTER TABLE sessions ADD COLUMN user_id UUID DEFAULT NULL;

-- Add index for faster user-based queries
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id, date DESC);

-- Remove the old permissive policy
DROP POLICY IF EXISTS "Allow all operations" ON sessions;

-- Create RLS policies for multi-user isolation

-- 1. Select policy: Users can only see their own sessions
CREATE POLICY "Users can select their own sessions"
  ON sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Insert policy: Users can only insert sessions for themselves
CREATE POLICY "Users can insert their own sessions"
  ON sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Update policy: Users can only update their own sessions
CREATE POLICY "Users can update their own sessions"
  ON sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Delete policy: Users can only delete their own sessions
CREATE POLICY "Users can delete their own sessions"
  ON sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment
COMMENT ON COLUMN sessions.user_id IS 'UUID of the user who owns this session (via Supabase Auth)';

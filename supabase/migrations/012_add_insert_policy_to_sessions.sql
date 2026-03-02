-- Add missing INSERT policy for sessions table

CREATE POLICY "Users can insert their own sessions or admins can insert any"
  ON sessions
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    public.is_user_admin(auth.uid())
  );

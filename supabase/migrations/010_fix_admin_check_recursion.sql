-- Fix infinite recursion in RLS policies by creating a SECURITY DEFINER function
-- This function checks if current user is admin WITHOUT triggering RLS policies

-- Create helper function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  -- Use SECURITY DEFINER to bypass RLS - only admin check, no data leakage
  SELECT is_admin INTO admin_status
  FROM profiles
  WHERE id = user_id;
  
  RETURN COALESCE(admin_status, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the problematic RLS policies from profiles table
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON profiles;

-- Drop the admin-checking policies from sessions table
DROP POLICY IF EXISTS "Users can select their own sessions or admins can select all" ON sessions;
DROP POLICY IF EXISTS "Users can update their own sessions or admins can update any" ON sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions or admins can delete any" ON sessions;

-- Recreate profiles RLS policies using the helper function
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (
    auth.uid() = id OR  -- Can always see own profile
    public.is_user_admin(auth.uid())  -- Or if user is admin
  );

CREATE POLICY "Admins can manage profiles"
  ON profiles
  FOR UPDATE
  USING (public.is_user_admin(auth.uid()))
  WITH CHECK (public.is_user_admin(auth.uid()));

-- Recreate sessions RLS policies using the helper function
CREATE POLICY "Users can select their own sessions or admins can select all"
  ON sessions
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    public.is_user_admin(auth.uid())
  );

CREATE POLICY "Users can update their own sessions or admins can update any"
  ON sessions
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    public.is_user_admin(auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id OR
    public.is_user_admin(auth.uid())
  );

CREATE POLICY "Users can delete their own sessions or admins can delete any"
  ON sessions
  FOR DELETE
  USING (
    auth.uid() = user_id OR
    public.is_user_admin(auth.uid())
  );

-- Ensure function has proper permissions
REVOKE ALL ON FUNCTION public.is_user_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_user_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_admin(UUID) TO anon;

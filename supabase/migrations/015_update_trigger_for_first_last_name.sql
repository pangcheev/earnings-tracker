-- Update the handle_new_user trigger to capture first_name and last_name from auth.users metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  first_name TEXT;
  last_name TEXT;
BEGIN
  -- Extract first_name and last_name from user metadata if available
  first_name := COALESCE(new.raw_user_meta_data->>'first_name', '');
  last_name := COALESCE(new.raw_user_meta_data->>'last_name', '');
  
  INSERT INTO public.profiles (id, email, first_name, last_name, is_admin)
  VALUES (new.id, new.email, first_name, last_name, false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

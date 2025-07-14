/*
  # Add User Profile Change Logging

  1. New Functions
    - `log_user_profile_changes()`: Trigger function to log changes to user_profiles table
  
  2. New Triggers
    - `on_user_profile_change`: Trigger that fires after INSERT, UPDATE, or DELETE on user_profiles
*/

-- Create the trigger function for logging user profile changes
CREATE OR REPLACE FUNCTION public.log_user_profile_changes()
RETURNS TRIGGER AS $$
DECLARE
    _user_id uuid;
    _action text;
    _resource text := 'user_profiles';
    _resource_id text;
    _ip_address text := 'N/A'; -- You might need to get this from a more advanced context
    _user_agent text := 'N/A'; -- You might need to get this from a more advanced context
BEGIN
    -- Determine the user performing the action (e.g., from session or a default)
    SELECT auth.uid() INTO _user_id;
    IF _user_id IS NULL THEN
        -- Fallback if no authenticated user (e.g., for system operations)
        _user_id := '00000000-0000-0000-0000-000000000000'; -- A placeholder for system actions
    END IF;

    -- Determine the action type
    IF TG_OP = 'INSERT' THEN
        _action := 'create';
        _resource_id := NEW.id::text;
    ELSIF TG_OP = 'UPDATE' THEN
        _action := 'update';
        _resource_id := NEW.id::text;
    ELSIF TG_OP = 'DELETE' THEN
        _action := 'delete';
        _resource_id := OLD.id::text;
    END IF;

    -- Insert into access_logs
    INSERT INTO public.access_logs (user_id, action, resource, resource_id, ip_address, user_agent)
    VALUES (_user_id, _action, _resource, _resource_id, _ip_address, _user_agent);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on the user_profiles table
DROP TRIGGER IF EXISTS on_user_profile_change ON public.user_profiles;

CREATE TRIGGER on_user_profile_change
AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION public.log_user_profile_changes();
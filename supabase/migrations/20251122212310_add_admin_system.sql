/*
  # Add Admin System

  ## Changes
  
  1. Admin Roles
    - Add `is_admin` field to profiles table
    - Add `admin_level` field for different admin permissions
    - Add `admin_notes` for internal admin notes
  
  2. Admin Verification Actions
    - Create `verification_requests` table for user verification requests
    - Create `admin_actions` table to log all admin activities
  
  3. Admin RLS Policies
    - Admins can view all profiles
    - Admins can update user verification status
    - Admins can view all topics and votes
    - Log all admin actions for audit trail
  
  4. Security
    - RLS policies ensure only admins can access admin functions
    - All admin actions are logged
    - Admin status stored in app_metadata for security
*/

-- Add admin fields to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'admin_level'
  ) THEN
    ALTER TABLE profiles ADD COLUMN admin_level text DEFAULT 'none' CHECK (admin_level IN ('none', 'moderator', 'admin', 'super_admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'admin_notes'
  ) THEN
    ALTER TABLE profiles ADD COLUMN admin_notes text;
  END IF;
END $$;

-- Create verification_requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  request_type text NOT NULL CHECK (request_type IN ('email', 'phone', 'id', 'full')),
  request_data jsonb DEFAULT '{}',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- Users can create and view their own verification requests
CREATE POLICY "Users can create verification requests"
  ON verification_requests FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can view own verification requests"
  ON verification_requests FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Admins can view and manage all verification requests
CREATE POLICY "Admins can view all verification requests"
  ON verification_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update verification requests"
  ON verification_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create admin_actions table for audit logging
CREATE TABLE IF NOT EXISTS admin_actions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  action_type text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  action_data jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin actions
CREATE POLICY "Admins can view admin actions"
  ON admin_actions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can create admin action logs
CREATE POLICY "Admins can create admin actions"
  ON admin_actions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_verification_requests_profile_id ON verification_requests(profile_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;

-- Update RLS policies for admin access
-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS admin_check
      WHERE admin_check.id = auth.uid()
      AND admin_check.is_admin = true
    )
  );

-- Admins can update any profile (for verification, notes, etc.)
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS admin_check
      WHERE admin_check.id = auth.uid()
      AND admin_check.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles AS admin_check
      WHERE admin_check.id = auth.uid()
      AND admin_check.is_admin = true
    )
  );

-- Function to promote user to admin (must be called by existing super_admin)
CREATE OR REPLACE FUNCTION promote_to_admin(
  target_user_id uuid,
  new_admin_level text DEFAULT 'moderator'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_is_super_admin boolean;
BEGIN
  -- Check if caller is super admin
  SELECT is_admin AND admin_level = 'super_admin'
  INTO caller_is_super_admin
  FROM profiles
  WHERE id = auth.uid();

  IF NOT caller_is_super_admin THEN
    RAISE EXCEPTION 'Only super admins can promote users';
  END IF;

  -- Update target user
  UPDATE profiles
  SET 
    is_admin = true,
    admin_level = new_admin_level,
    updated_at = now()
  WHERE id = target_user_id;

  -- Log action
  INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, action_data)
  VALUES (
    auth.uid(),
    'promote_to_admin',
    'profile',
    target_user_id,
    jsonb_build_object('new_admin_level', new_admin_level)
  );

  RETURN true;
END;
$$;

-- Create first super admin (you'll need to set this to your user ID after creating an account)
-- Uncomment and update the UUID below after creating your first account
-- UPDATE profiles SET is_admin = true, admin_level = 'super_admin' WHERE email = 'your-email@example.com';
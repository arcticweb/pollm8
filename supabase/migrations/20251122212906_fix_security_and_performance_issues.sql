/*
  # Fix Security and Performance Issues

  ## Changes
  
  1. Add Missing Indexes on Foreign Keys
    - Add indexes for all unindexed foreign keys
    - Improves join performance and query optimization
  
  2. Optimize RLS Policies
    - Replace auth.uid() with (select auth.uid())
    - Prevents re-evaluation of auth function for each row
    - Significantly improves performance at scale
  
  3. Consolidate Multiple Permissive Policies
    - Merge duplicate SELECT and UPDATE policies
    - Reduces policy evaluation overhead
  
  4. Fix Function Search Path
    - Set search_path for security definer functions
    - Prevents search path manipulation attacks
  
  5. Move Extension to Extensions Schema
    - Move pg_trgm from public to extensions schema
    - Follows PostgreSQL security best practices

  ## Security
  - All RLS policies optimized for performance
  - Function search paths secured
  - Foreign key indexes prevent query degradation
*/

-- =====================================================
-- 1. ADD MISSING INDEXES ON FOREIGN KEYS
-- =====================================================

-- api_keys indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_profile_id ON api_keys(profile_id);

-- notification_channels indexes
CREATE INDEX IF NOT EXISTS idx_notification_channels_profile_id ON notification_channels(profile_id);

-- topic_similarity_suggestions indexes
CREATE INDEX IF NOT EXISTS idx_topic_similarity_suggestions_topic_id ON topic_similarity_suggestions(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_similarity_suggestions_similar_topic_id ON topic_similarity_suggestions(similar_topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_similarity_suggestions_reviewed_by ON topic_similarity_suggestions(reviewed_by);

-- topics indexes
CREATE INDEX IF NOT EXISTS idx_topics_vote_type_id ON topics(vote_type_id);
CREATE INDEX IF NOT EXISTS idx_topics_linked_topic_id ON topics(linked_topic_id);

-- verification_requests indexes
CREATE INDEX IF NOT EXISTS idx_verification_requests_reviewed_by ON verification_requests(reviewed_by);

-- =====================================================
-- 2. OPTIMIZE RLS POLICIES - Replace auth.uid() with (select auth.uid())
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own demographics" ON profile_demographics;
DROP POLICY IF EXISTS "Users can manage own demographics" ON profile_demographics;
DROP POLICY IF EXISTS "Authenticated users can create topics" ON topics;
DROP POLICY IF EXISTS "Users can update own topics" ON topics;
DROP POLICY IF EXISTS "Topic creators can view suggestions for their topics" ON topic_similarity_suggestions;
DROP POLICY IF EXISTS "Users can view own votes" ON votes;
DROP POLICY IF EXISTS "Users can cast votes" ON votes;
DROP POLICY IF EXISTS "Users can update own votes" ON votes;
DROP POLICY IF EXISTS "Users can manage own notification channels" ON notification_channels;
DROP POLICY IF EXISTS "Users can manage own notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can create analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Users can manage own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can create verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Users can view own verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Admins can view all verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Admins can update verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Admins can view admin actions" ON admin_actions;
DROP POLICY IF EXISTS "Admins can create admin actions" ON admin_actions;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- =====================================================
-- PROFILES - Consolidated and Optimized Policies
-- =====================================================

-- Consolidated SELECT policy (users can view all profiles OR admins can view all)
CREATE POLICY "Users and admins can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    true OR -- All authenticated users can view profiles
    EXISTS (
      SELECT 1 FROM profiles AS admin_check
      WHERE admin_check.id = (select auth.uid())
      AND admin_check.is_admin = true
    )
  );

-- Consolidated UPDATE policy (users can update own OR admins can update any)
CREATE POLICY "Users can update own profile, admins can update any"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles AS admin_check
      WHERE admin_check.id = (select auth.uid())
      AND admin_check.is_admin = true
    )
  )
  WITH CHECK (
    id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles AS admin_check
      WHERE admin_check.id = (select auth.uid())
      AND admin_check.is_admin = true
    )
  );

-- INSERT policy
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- =====================================================
-- PROFILE DEMOGRAPHICS - Consolidated Policies
-- =====================================================

-- Consolidated policy for all operations
CREATE POLICY "Users can manage own demographics"
  ON profile_demographics FOR ALL
  TO authenticated
  USING (profile_id = (select auth.uid()))
  WITH CHECK (profile_id = (select auth.uid()));

-- =====================================================
-- TOPICS - Optimized Policies
-- =====================================================

CREATE POLICY "Authenticated users can create topics"
  ON topics FOR INSERT
  TO authenticated
  WITH CHECK (created_by = (select auth.uid()));

CREATE POLICY "Users can update own topics"
  ON topics FOR UPDATE
  TO authenticated
  USING (created_by = (select auth.uid()))
  WITH CHECK (created_by = (select auth.uid()));

-- =====================================================
-- TOPIC SIMILARITY SUGGESTIONS - Optimized Policies
-- =====================================================

CREATE POLICY "Topic creators can view suggestions for their topics"
  ON topic_similarity_suggestions FOR SELECT
  TO authenticated
  USING (
    topic_id IN (SELECT id FROM topics WHERE created_by = (select auth.uid()))
  );

-- =====================================================
-- VOTES - Optimized Policies
-- =====================================================

CREATE POLICY "Users can view own votes"
  ON votes FOR SELECT
  TO authenticated
  USING (profile_id = (select auth.uid()));

CREATE POLICY "Users can cast votes"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = (select auth.uid()));

CREATE POLICY "Users can update own votes"
  ON votes FOR UPDATE
  TO authenticated
  USING (profile_id = (select auth.uid()))
  WITH CHECK (profile_id = (select auth.uid()));

-- =====================================================
-- NOTIFICATION CHANNELS - Optimized Policies
-- =====================================================

CREATE POLICY "Users can manage own notification channels"
  ON notification_channels FOR ALL
  TO authenticated
  USING (profile_id = (select auth.uid()))
  WITH CHECK (profile_id = (select auth.uid()));

-- =====================================================
-- NOTIFICATION PREFERENCES - Optimized Policies
-- =====================================================

CREATE POLICY "Users can manage own notification preferences"
  ON notification_preferences FOR ALL
  TO authenticated
  USING (profile_id = (select auth.uid()))
  WITH CHECK (profile_id = (select auth.uid()));

-- =====================================================
-- ANALYTICS EVENTS - Optimized Policies
-- =====================================================

CREATE POLICY "Users can create analytics events"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = (select auth.uid()) OR profile_id IS NULL);

-- =====================================================
-- API KEYS - Optimized Policies
-- =====================================================

CREATE POLICY "Users can manage own API keys"
  ON api_keys FOR ALL
  TO authenticated
  USING (profile_id = (select auth.uid()))
  WITH CHECK (profile_id = (select auth.uid()));

-- =====================================================
-- VERIFICATION REQUESTS - Consolidated and Optimized Policies
-- =====================================================

CREATE POLICY "Users can create verification requests"
  ON verification_requests FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = (select auth.uid()));

-- Consolidated SELECT policy
CREATE POLICY "Users can view own requests, admins can view all"
  ON verification_requests FOR SELECT
  TO authenticated
  USING (
    profile_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update verification requests"
  ON verification_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );

-- =====================================================
-- ADMIN ACTIONS - Optimized Policies
-- =====================================================

CREATE POLICY "Admins can view admin actions"
  ON admin_actions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can create admin actions"
  ON admin_actions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );

-- =====================================================
-- 3. FIX FUNCTION SEARCH PATH
-- =====================================================

-- Recreate function with secure search_path
CREATE OR REPLACE FUNCTION promote_to_admin(
  target_user_id uuid,
  new_admin_level text DEFAULT 'moderator'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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

-- =====================================================
-- 4. MOVE EXTENSION TO EXTENSIONS SCHEMA
-- =====================================================

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_trgm extension
DO $$
BEGIN
  -- Drop from public if it exists there
  IF EXISTS (
    SELECT 1 FROM pg_extension
    WHERE extname = 'pg_trgm'
    AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    DROP EXTENSION IF EXISTS pg_trgm CASCADE;
  END IF;

  -- Create in extensions schema
  CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;
END $$;

-- Update the index to use the extension from the new schema
DROP INDEX IF EXISTS idx_topics_title_trgm;
CREATE INDEX idx_topics_title_trgm ON topics USING gin(title extensions.gin_trgm_ops);

-- =====================================================
-- 5. ADDITIONAL PERFORMANCE INDEXES
-- =====================================================

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_topics_active_created ON topics(is_active, created_at DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_votes_topic_profile ON votes(topic_id, profile_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status_created ON verification_requests(status, created_at DESC);

-- =====================================================
-- 6. ANALYZE TABLES FOR QUERY PLANNER
-- =====================================================

ANALYZE profiles;
ANALYZE topics;
ANALYZE votes;
ANALYZE verification_requests;
ANALYZE admin_actions;
ANALYZE notification_channels;
ANALYZE notification_preferences;
ANALYZE api_keys;
ANALYZE analytics_events;
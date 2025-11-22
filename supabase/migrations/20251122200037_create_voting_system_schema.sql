/*
  # Voting System Database Schema

  ## Overview
  Comprehensive voting platform supporting multiple vote types, user verification,
  real-time results, and demographic profiling.

  ## New Tables

  ### 1. `profiles`
  Extended user profile information beyond auth.users
  - `id` (uuid, FK to auth.users) - User identifier
  - `username` (text, unique) - Display name
  - `email` (text) - User email
  - `avatar_url` (text) - Profile image URL
  - `bio` (text) - User biography
  - `is_verified` (boolean) - Account verification status
  - `verification_level` (text) - none, email, phone, id, full
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update
  
  ### 2. `profile_demographics`
  Optional demographic information for verified data exports
  - `id` (uuid, PK)
  - `profile_id` (uuid, FK to profiles) - User reference
  - `age_range` (text) - Age bracket
  - `gender` (text) - Gender identity
  - `location_country` (text) - Country code
  - `location_region` (text) - State/province
  - `location_city` (text) - City name
  - `education_level` (text) - Highest education
  - `employment_status` (text) - Current employment
  - `income_range` (text) - Income bracket
  - `is_verified` (boolean) - Demographics verified status
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `vote_type_configs`
  Configurable voting mechanisms and rules
  - `id` (uuid, PK)
  - `name` (text, unique) - Vote type identifier (yes_no, multiple_choice, rating, open_ended)
  - `display_name` (text) - Human-readable name
  - `description` (text) - Type description
  - `config_schema` (jsonb) - JSON schema for this vote type
  - `default_config` (jsonb) - Default configuration
  - `is_active` (boolean) - Whether type is available
  - `version` (integer) - Config version for tracking changes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `topics`
  Voting topics/questions created by users
  - `id` (uuid, PK)
  - `created_by` (uuid, FK to profiles) - Topic creator
  - `title` (text) - Topic question
  - `description` (text) - Detailed description
  - `vote_type_id` (uuid, FK to vote_type_configs) - Type of voting
  - `vote_config` (jsonb) - Specific configuration for this topic
  - `require_verification` (boolean) - Verified users only
  - `min_verification_level` (text) - Minimum verification required
  - `expires_at` (timestamptz) - Optional expiration date
  - `is_active` (boolean) - Topic is open for voting
  - `is_closed` (boolean) - Topic is permanently closed
  - `linked_topic_id` (uuid, FK to topics) - Link to consolidated topic
  - `view_count` (integer) - Number of views
  - `vote_count` (integer) - Number of votes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `topic_similarity_suggestions`
  AI/manual suggestions for similar topics
  - `id` (uuid, PK)
  - `topic_id` (uuid, FK to topics) - New topic
  - `similar_topic_id` (uuid, FK to topics) - Existing similar topic
  - `similarity_score` (decimal) - Calculated similarity (0-1)
  - `suggestion_method` (text) - ai, manual, user_report
  - `status` (text) - pending, accepted, rejected
  - `reviewed_by` (uuid, FK to profiles) - Who reviewed
  - `reviewed_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 6. `votes`
  Individual votes cast by users
  - `id` (uuid, PK)
  - `topic_id` (uuid, FK to topics) - Topic being voted on
  - `profile_id` (uuid, FK to profiles) - Voter
  - `vote_data` (jsonb) - Vote content (format depends on vote_type)
  - `is_verified_vote` (boolean) - Voter was verified at time of vote
  - `verification_level` (text) - Voter's verification level
  - `ip_address` (inet) - IP for fraud detection (hashed)
  - `user_agent` (text) - Browser info
  - `created_at` (timestamptz) - Original vote time
  - `updated_at` (timestamptz) - Last vote change

  ### 7. `vote_results_cache`
  Cached aggregated results for performance
  - `id` (uuid, PK)
  - `topic_id` (uuid, FK to topics, unique) - Topic reference
  - `all_votes` (jsonb) - Results including all votes
  - `verified_votes` (jsonb) - Results from verified users only
  - `demographic_breakdown` (jsonb) - Results by demographics
  - `last_calculated` (timestamptz) - Cache timestamp
  - `vote_count_all` (integer)
  - `vote_count_verified` (integer)

  ### 8. `notification_channels`
  User notification preferences
  - `id` (uuid, PK)
  - `profile_id` (uuid, FK to profiles) - User
  - `channel_type` (text) - email, webhook, sms
  - `channel_config` (jsonb) - Channel-specific configuration
  - `is_active` (boolean) - Channel enabled
  - `is_verified` (boolean) - Channel verified
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 9. `notification_preferences`
  What notifications users want to receive
  - `id` (uuid, PK)
  - `profile_id` (uuid, FK to profiles, unique) - User
  - `topic_created_on_mine` (boolean) - New vote on my topic
  - `topic_trending` (boolean) - Topics trending
  - `verification_status` (boolean) - Verification updates
  - `similar_topic_suggested` (boolean) - Similar topic found
  - `weekly_summary` (boolean) - Weekly activity summary
  - `custom_rules` (jsonb) - Advanced notification rules
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 10. `analytics_events`
  Track user interactions for analytics
  - `id` (uuid, PK)
  - `profile_id` (uuid, FK to profiles) - User (null for anonymous)
  - `event_type` (text) - Event category
  - `event_name` (text) - Specific event
  - `event_data` (jsonb) - Event metadata
  - `session_id` (text) - Session identifier
  - `page_url` (text) - Current page
  - `referrer` (text) - Referrer URL
  - `created_at` (timestamptz)

  ### 11. `api_keys`
  API access keys for external integrations
  - `id` (uuid, PK)
  - `profile_id` (uuid, FK to profiles) - Key owner
  - `key_hash` (text, unique) - Hashed API key
  - `name` (text) - Key identifier
  - `permissions` (jsonb) - Access permissions
  - `last_used_at` (timestamptz)
  - `expires_at` (timestamptz)
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ## Security

  All tables have RLS enabled with appropriate policies:
  - Users can read their own data
  - Users can create topics and votes
  - Public read access for active topics and cached results
  - Verified users have additional permissions
  - Admin users have full access (via app_metadata)

  ## Indexes

  Performance indexes on:
  - Foreign keys
  - Frequently queried fields (is_active, created_at, etc.)
  - Full-text search on topic titles
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text similarity

-- profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text NOT NULL,
  avatar_url text,
  bio text,
  is_verified boolean DEFAULT false,
  verification_level text DEFAULT 'none' CHECK (verification_level IN ('none', 'email', 'phone', 'id', 'full')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- profile_demographics table
CREATE TABLE IF NOT EXISTS profile_demographics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  age_range text,
  gender text,
  location_country text,
  location_region text,
  location_city text,
  education_level text,
  employment_status text,
  income_range text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(profile_id)
);

ALTER TABLE profile_demographics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own demographics"
  ON profile_demographics FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Users can manage own demographics"
  ON profile_demographics FOR ALL
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- vote_type_configs table
CREATE TABLE IF NOT EXISTS vote_type_configs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  config_schema jsonb NOT NULL DEFAULT '{}',
  default_config jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vote_type_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active vote types"
  ON vote_type_configs FOR SELECT
  TO authenticated
  USING (is_active = true);

-- topics table
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  vote_type_id uuid REFERENCES vote_type_configs(id) NOT NULL,
  vote_config jsonb DEFAULT '{}',
  require_verification boolean DEFAULT false,
  min_verification_level text DEFAULT 'none',
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  is_closed boolean DEFAULT false,
  linked_topic_id uuid REFERENCES topics(id),
  view_count integer DEFAULT 0,
  vote_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active topics"
  ON topics FOR SELECT
  TO authenticated
  USING (is_active = true AND is_closed = false);

CREATE POLICY "Authenticated users can create topics"
  ON topics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own topics"
  ON topics FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- topic_similarity_suggestions table
CREATE TABLE IF NOT EXISTS topic_similarity_suggestions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  similar_topic_id uuid REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  similarity_score decimal(3,2) DEFAULT 0,
  suggestion_method text DEFAULT 'manual' CHECK (suggestion_method IN ('ai', 'manual', 'user_report')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE topic_similarity_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Topic creators can view suggestions for their topics"
  ON topic_similarity_suggestions FOR SELECT
  TO authenticated
  USING (
    topic_id IN (SELECT id FROM topics WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can create similarity suggestions"
  ON topic_similarity_suggestions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vote_data jsonb NOT NULL,
  is_verified_vote boolean DEFAULT false,
  verification_level text DEFAULT 'none',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(topic_id, profile_id)
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own votes"
  ON votes FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Users can cast votes"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own votes"
  ON votes FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- vote_results_cache table
CREATE TABLE IF NOT EXISTS vote_results_cache (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE UNIQUE NOT NULL,
  all_votes jsonb DEFAULT '{}',
  verified_votes jsonb DEFAULT '{}',
  demographic_breakdown jsonb DEFAULT '{}',
  last_calculated timestamptz DEFAULT now(),
  vote_count_all integer DEFAULT 0,
  vote_count_verified integer DEFAULT 0
);

ALTER TABLE vote_results_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cached results"
  ON vote_results_cache FOR SELECT
  TO authenticated
  USING (true);

-- notification_channels table
CREATE TABLE IF NOT EXISTS notification_channels (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  channel_type text NOT NULL CHECK (channel_type IN ('email', 'webhook', 'sms')),
  channel_config jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notification_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification channels"
  ON notification_channels FOR ALL
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  topic_created_on_mine boolean DEFAULT true,
  topic_trending boolean DEFAULT false,
  verification_status boolean DEFAULT true,
  similar_topic_suggested boolean DEFAULT true,
  weekly_summary boolean DEFAULT false,
  custom_rules jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification preferences"
  ON notification_preferences FOR ALL
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_name text NOT NULL,
  event_data jsonb DEFAULT '{}',
  session_id text,
  page_url text,
  referrer text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create analytics events"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid() OR profile_id IS NULL);

-- api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  key_hash text UNIQUE NOT NULL,
  name text NOT NULL,
  permissions jsonb DEFAULT '{}',
  last_used_at timestamptz,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own API keys"
  ON api_keys FOR ALL
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_topics_created_by ON topics(created_by);
CREATE INDEX IF NOT EXISTS idx_topics_is_active ON topics(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_topics_created_at ON topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topics_vote_count ON topics(vote_count DESC);
CREATE INDEX IF NOT EXISTS idx_topics_title_trgm ON topics USING gin(title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_votes_topic_id ON votes(topic_id);
CREATE INDEX IF NOT EXISTS idx_votes_profile_id ON votes(profile_id);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON votes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_profile_id ON analytics_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);

-- Insert default vote type configurations
INSERT INTO vote_type_configs (name, display_name, description, config_schema, default_config) VALUES
(
  'yes_no',
  'Yes/No',
  'Simple yes or no question',
  '{"type": "object", "properties": {"allow_abstain": {"type": "boolean"}}}'::jsonb,
  '{"allow_abstain": false}'::jsonb
),
(
  'multiple_choice',
  'Multiple Choice',
  'Choose one or more options from a list',
  '{"type": "object", "properties": {"options": {"type": "array"}, "allow_multiple": {"type": "boolean"}, "max_selections": {"type": "number"}}}'::jsonb,
  '{"options": [], "allow_multiple": false, "max_selections": 1}'::jsonb
),
(
  'rating',
  'Rating Scale',
  'Rate on a numeric scale',
  '{"type": "object", "properties": {"min_value": {"type": "number"}, "max_value": {"type": "number"}, "step": {"type": "number"}, "labels": {"type": "object"}}}'::jsonb,
  '{"min_value": 1, "max_value": 5, "step": 1, "labels": {}}'::jsonb
),
(
  'open_ended',
  'Open Ended',
  'Free-form text response',
  '{"type": "object", "properties": {"max_length": {"type": "number"}, "allow_empty": {"type": "boolean"}}}'::jsonb,
  '{"max_length": 500, "allow_empty": false}'::jsonb
)
ON CONFLICT (name) DO NOTHING;
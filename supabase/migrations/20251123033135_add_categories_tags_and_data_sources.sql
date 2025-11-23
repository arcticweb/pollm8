/*
  # Categories, Tags, and Data Sources System

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `description` (text, nullable)
      - `parent_id` (uuid, nullable, self-referencing for hierarchy)
      - `icon` (text, nullable)
      - `color` (text, nullable)
      - `display_order` (integer)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `tags`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `description` (text, nullable)
      - `color` (text, nullable)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `topic_categories`
      - `id` (uuid, primary key)
      - `topic_id` (uuid, foreign key to topics)
      - `category_id` (uuid, foreign key to categories)
      - `assigned_by` (uuid, foreign key to profiles, nullable)
      - `is_trusted` (boolean, default false) - true if assigned by admin/trusted source
      - `created_at` (timestamptz)

    - `topic_tags`
      - `id` (uuid, primary key)
      - `topic_id` (uuid, foreign key to topics)
      - `tag_id` (uuid, foreign key to tags)
      - `assigned_by` (uuid, foreign key to profiles, nullable)
      - `is_trusted` (boolean, default false)
      - `created_at` (timestamptz)

    - `data_sources`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text, nullable)
      - `source_type` (text) - 'api', 'scraper', 'rss', 'csv', 'json', 'manual'
      - `source_url` (text, nullable)
      - `config` (jsonb) - flexible configuration for different source types
      - `is_active` (boolean, default true)
      - `is_trusted` (boolean, default false) - if true, auto-tags are trusted
      - `last_sync_at` (timestamptz, nullable)
      - `sync_frequency` (text, nullable) - 'hourly', 'daily', 'weekly', 'manual'
      - `created_by` (uuid, foreign key to profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `data_source_imports`
      - `id` (uuid, primary key)
      - `data_source_id` (uuid, foreign key to data_sources)
      - `status` (text) - 'pending', 'processing', 'completed', 'failed'
      - `topics_imported` (integer, default 0)
      - `topics_updated` (integer, default 0)
      - `topics_skipped` (integer, default 0)
      - `error_message` (text, nullable)
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz, nullable)
      - `metadata` (jsonb, nullable)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to read active categories/tags
    - Add policies for admins to manage everything
    - Add policies for users to suggest categories/tags (untrusted)
    - Add policies for trusted data sources
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  icon text,
  color text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  color text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Topic categories junction table
CREATE TABLE IF NOT EXISTS topic_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  assigned_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  is_trusted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(topic_id, category_id, assigned_by)
);

-- Topic tags junction table
CREATE TABLE IF NOT EXISTS topic_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  assigned_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  is_trusted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(topic_id, tag_id, assigned_by)
);

-- Data sources table
CREATE TABLE IF NOT EXISTS data_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  source_type text NOT NULL CHECK (source_type IN ('api', 'scraper', 'rss', 'csv', 'json', 'manual', 'python_script')),
  source_url text,
  config jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  is_trusted boolean DEFAULT false,
  last_sync_at timestamptz,
  sync_frequency text CHECK (sync_frequency IN ('hourly', 'daily', 'weekly', 'manual')),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Data source imports table
CREATE TABLE IF NOT EXISTS data_source_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_source_id uuid REFERENCES data_sources(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  topics_imported integer DEFAULT 0,
  topics_updated integer DEFAULT 0,
  topics_skipped integer DEFAULT 0,
  error_message text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_tags_active ON tags(is_active);
CREATE INDEX IF NOT EXISTS idx_topic_categories_topic ON topic_categories(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_categories_category ON topic_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_topic_categories_trusted ON topic_categories(is_trusted);
CREATE INDEX IF NOT EXISTS idx_topic_tags_topic ON topic_tags(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_tags_tag ON topic_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_topic_tags_trusted ON topic_tags(is_trusted);
CREATE INDEX IF NOT EXISTS idx_data_sources_active ON data_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_data_sources_trusted ON data_sources(is_trusted);
CREATE INDEX IF NOT EXISTS idx_data_source_imports_status ON data_source_imports(status);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_source_imports ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
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

-- Tags policies
CREATE POLICY "Anyone can view active tags"
  ON tags FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage tags"
  ON tags FOR ALL
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

-- Topic categories policies
CREATE POLICY "Anyone can view trusted topic categories"
  ON topic_categories FOR SELECT
  USING (is_trusted = true);

CREATE POLICY "Users can view their own category assignments"
  ON topic_categories FOR SELECT
  TO authenticated
  USING (assigned_by = auth.uid());

CREATE POLICY "Authenticated users can assign categories"
  ON topic_categories FOR INSERT
  TO authenticated
  WITH CHECK (assigned_by = auth.uid());

CREATE POLICY "Users can delete their own category assignments"
  ON topic_categories FOR DELETE
  TO authenticated
  USING (assigned_by = auth.uid() AND is_trusted = false);

CREATE POLICY "Admins can manage all topic categories"
  ON topic_categories FOR ALL
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

-- Topic tags policies (similar to categories)
CREATE POLICY "Anyone can view trusted topic tags"
  ON topic_tags FOR SELECT
  USING (is_trusted = true);

CREATE POLICY "Users can view their own tag assignments"
  ON topic_tags FOR SELECT
  TO authenticated
  USING (assigned_by = auth.uid());

CREATE POLICY "Authenticated users can assign tags"
  ON topic_tags FOR INSERT
  TO authenticated
  WITH CHECK (assigned_by = auth.uid());

CREATE POLICY "Users can delete their own tag assignments"
  ON topic_tags FOR DELETE
  TO authenticated
  USING (assigned_by = auth.uid() AND is_trusted = false);

CREATE POLICY "Admins can manage all topic tags"
  ON topic_tags FOR ALL
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

-- Data sources policies
CREATE POLICY "Anyone can view active trusted data sources"
  ON data_sources FOR SELECT
  USING (is_active = true AND is_trusted = true);

CREATE POLICY "Users can view their own data sources"
  ON data_sources FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Authenticated users can create data sources"
  ON data_sources FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own data sources"
  ON data_sources FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can manage all data sources"
  ON data_sources FOR ALL
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

-- Data source imports policies
CREATE POLICY "Users can view imports for their data sources"
  ON data_source_imports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM data_sources
      WHERE data_sources.id = data_source_imports.data_source_id
      AND data_sources.created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can view all imports"
  ON data_source_imports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "System can manage imports"
  ON data_source_imports FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_sources_updated_at
  BEFORE UPDATE ON data_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

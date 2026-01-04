-- ExileForge Database Schema
-- PostgreSQL 15+

-- Enable UUID extension (optional)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  prefer_no_uniques BOOLEAN DEFAULT FALSE,
  prefer_no_rare_uniques BOOLEAN DEFAULT FALSE,
  allow_respec BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Builds table
CREATE TABLE builds (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  class VARCHAR(50) NOT NULL,
  ascendancy VARCHAR(100),
  main_skill VARCHAR(100) NOT NULL,
  playstyle_description TEXT,
  
  -- Build data (JSON)
  build_data JSONB NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_public BOOLEAN DEFAULT FALSE,
  downloads INT DEFAULT 0
);

-- Build versions (for history)
CREATE TABLE build_versions (
  id SERIAL PRIMARY KEY,
  build_id INT REFERENCES builds(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  build_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(build_id, version_number)
);

-- Indexes for performance
CREATE INDEX idx_builds_user_id ON builds(user_id);
CREATE INDEX idx_builds_public ON builds(is_public);
CREATE INDEX idx_builds_class ON builds(class);
CREATE INDEX idx_builds_main_skill ON builds(main_skill);
CREATE INDEX idx_build_versions_build_id ON build_versions(build_id);
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_username ON users(username);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_builds_updated_at BEFORE UPDATE ON builds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts for ExileForge';
COMMENT ON TABLE builds IS 'Generated PoE2 builds with full data in JSONB';
COMMENT ON TABLE build_versions IS 'Version history for build changes';
COMMENT ON COLUMN builds.build_data IS 'Complete build structure including leveling guide, gear, passives';

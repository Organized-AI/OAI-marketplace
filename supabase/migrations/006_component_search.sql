-- Component Search Enhancement Migration
-- Adds full-text search capabilities with tsvector and category filtering

-- 1. Add new columns to components table
-- Note: icon column already exists from 001_marketplace.sql
ALTER TABLE components
ADD COLUMN IF NOT EXISTS search_vector tsvector,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Update existing data: Set category = type where category is null
UPDATE components
SET category = type
WHERE category IS NULL;

-- 3. Update icon based on type for any missing icons
UPDATE components
SET icon = CASE
  WHEN type = 'agent' THEN '🤖'
  WHEN type = 'subagent' THEN '🤖'
  WHEN type = 'mcp' THEN '🔌'
  WHEN type = 'hook' THEN '🪝'
  WHEN type = 'command' THEN '⚡'
  WHEN type = 'setting' THEN '⚙️'
  WHEN type = 'skill' THEN '🎯'
  ELSE '📦'
END
WHERE icon IS NULL;

-- 4. Create search_vector from name, description, and tags
-- Name gets weight 'A' (highest), Description gets 'B', Tags get 'C'
UPDATE components
SET search_vector =
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(array_to_string(tags, ' '), '')), 'C');

-- 5. Create trigger function to auto-update search_vector on INSERT or UPDATE
CREATE OR REPLACE FUNCTION update_components_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');

  -- Also auto-set category from type if not provided
  IF NEW.category IS NULL THEN
    NEW.category := NEW.type;
  END IF;

  -- Auto-set icon if not provided
  IF NEW.icon IS NULL THEN
    NEW.icon := CASE
      WHEN NEW.type = 'agent' THEN '🤖'
      WHEN NEW.type = 'subagent' THEN '🤖'
      WHEN NEW.type = 'mcp' THEN '🔌'
      WHEN NEW.type = 'hook' THEN '🪝'
      WHEN NEW.type = 'command' THEN '⚡'
      WHEN NEW.type = 'setting' THEN '⚙️'
      WHEN NEW.type = 'skill' THEN '🎯'
      ELSE '📦'
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger on components table for search vector updates
DROP TRIGGER IF EXISTS trigger_update_components_search_vector ON components;
CREATE TRIGGER trigger_update_components_search_vector
  BEFORE INSERT OR UPDATE ON components
  FOR EACH ROW
  EXECUTE FUNCTION update_components_search_vector();

-- 7. Create indexes for performance
-- GIN index on search_vector for full-text search
CREATE INDEX IF NOT EXISTS idx_components_search_vector
  ON components USING GIN(search_vector);

-- B-tree index on category for filtering
CREATE INDEX IF NOT EXISTS idx_components_category
  ON components(category);

-- Index on is_active for filtering active components
CREATE INDEX IF NOT EXISTS idx_components_is_active
  ON components(is_active);

-- Note: GIN index on tags already exists from 001_marketplace.sql

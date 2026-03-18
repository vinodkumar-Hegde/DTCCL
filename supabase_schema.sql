
-- Supabase SQL Schema for Clinical Case Management

-- 1. Create the clinical_cases table
CREATE TABLE IF NOT EXISTS clinical_cases (
  id TEXT PRIMARY KEY,
  disease_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  super_speciality TEXT,
  severity TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  data JSONB NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE clinical_cases ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
-- Allow public read access (for doctors to view cases)
CREATE POLICY "Allow public read access" 
ON clinical_cases FOR SELECT 
USING (true);

-- Allow all access for now (for admin to add/edit cases)
-- In a production app, you would restrict this to authenticated admins
CREATE POLICY "Allow all access for authorized users" 
ON clinical_cases FOR ALL 
USING (true);

-- 4. Create an index on JSONB data for common queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_clinical_cases_subject ON clinical_cases (subject);
CREATE INDEX IF NOT EXISTS idx_clinical_cases_disease_name ON clinical_cases (disease_name);

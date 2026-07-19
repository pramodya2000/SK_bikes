-- =============================================
-- SK Bikes - Row Level Security Policies
-- Run this AFTER schema.sql in Supabase SQL Editor
-- =============================================

-- Enable RLS on both tables
ALTER TABLE bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE helmets ENABLE ROW LEVEL SECURITY;

-- bikes policies
CREATE POLICY "Allow public read" ON bikes FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON bikes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON bikes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON bikes FOR DELETE USING (auth.role() = 'authenticated');

-- helmets policies
CREATE POLICY "Allow public read" ON helmets FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON helmets FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON helmets FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON helmets FOR DELETE USING (auth.role() = 'authenticated');

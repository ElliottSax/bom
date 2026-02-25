-- Temporary policy to allow verse imports
-- This will be reverted after data import is complete

CREATE POLICY "temp_allow_verse_insert"
  ON verses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "temp_allow_cross_ref_insert"
  ON cross_references FOR INSERT
  WITH CHECK (true);

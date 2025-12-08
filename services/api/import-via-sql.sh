#!/bin/bash
# Import verses from JSON file directly via SQL

# Read JSON file and convert to SQL INSERT statements
cat prisma/seeds/scraped/coc-bom-1nephi-ch1.json | \
docker exec -i pod_postgres psql -U pod_user -d bom_study_tools -c "
  WITH json_data AS (
    SELECT json_array_elements('$(cat prisma/seeds/scraped/coc-bom-1nephi-ch1.json)'::json) AS verse
  )
  INSERT INTO verses (id, \"editionId\", book, chapter, verse, text, \"verseType\")
  SELECT
    (verse->>'id')::text,
    (verse->>'editionId')::text,
    (verse->>'book')::text,
    (verse->>'chapter')::integer,
    (verse->>'verse')::integer,
    (verse->>'text')::text,
    (verse->>'verseType')::text
  FROM json_data
  ON CONFLICT (id) DO NOTHING;
"

echo "Import complete!"

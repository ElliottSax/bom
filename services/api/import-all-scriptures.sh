#!/bin/bash

# Import all Book of Mormon books
echo "Importing Book of Mormon books..."
for book in 2nephi 3nephi 4nephi alma enos ether helaman jacob jarom mormon moroni mosiah omni wordsofmormon; do
  echo "Importing $book..."
  cat services/api/prisma/seeds/scraped/import-$book-complete.sql | docker exec -i bom-postgres-dev psql -U postgres -d bom_study_tools_dev > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "✓ $book imported successfully"
  else
    echo "✗ $book import had some errors (may be duplicates)"
  fi
done

# Import Doctrine & Covenants sections
echo ""
echo "Importing Doctrine & Covenants sections..."
for sections in "4-10-fixed" "11-30" "31-60" "61-90" "91-120" "121-167"; do
  echo "Importing D&C sections $sections..."
  cat services/api/prisma/seeds/scraped/import-dc-sections-$sections.sql | docker exec -i bom-postgres-dev psql -U postgres -d bom_study_tools_dev > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "✓ D&C sections $sections imported successfully"
  else
    echo "✗ D&C sections $sections import had some errors (may be duplicates)"
  fi
done

echo ""
echo "Import complete! Checking verse count..."
docker exec bom-postgres-dev psql -U postgres -d bom_study_tools_dev -c 'SELECT COUNT(*) as total_verses FROM verses;'

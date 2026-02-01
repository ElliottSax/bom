# How to Obtain Community of Christ D&C Sections 160-165

## Quick Summary

**Status**: Sections 114-159 are complete. Sections 160-165 still needed.

**Recommended Approach**: Contact Community of Christ directly for permission.

## Step-by-Step Guide

### Option 1: Contact Community of Christ (Recommended) ⭐

#### 1. Draft Permission Request Email

```
To: Community of Christ Scripture Publishing
Subject: Permission Request for Educational Scripture Study Platform

Dear Community of Christ Scripture Publishing Team,

I am developing a non-commercial, educational scripture study platform
called "BOM Study Tools" that helps people study Restoration scripture
traditions including the Book of Mormon and Doctrine & Covenants.

The platform currently includes:
- Searchable scripture text with cross-references
- Study notes and bookmarking features
- Comparison tools for different editions
- Historical context and background information

I have successfully included Community of Christ D&C sections 114-159
from publicly available sources (centerplace.org) and would like to
respectfully request permission to include sections 160-165 to provide
a complete study resource.

Platform Details:
- Non-commercial and free to users
- Educational purpose only
- Proper attribution: "© Community of Christ"
- Open to adding any disclaimers or notices you require
- Willing to link to official cofchrist.org resources

Would you be willing to grant permission for educational use of these
scripture texts? I would be happy to discuss any requirements or
conditions for their use.

Thank you for considering this request.

Respectfully,
[Your Name]
[Your Email]
[Link to Platform/GitHub if applicable]
```

#### 2. Contact Information

**Primary Contact**:

- Website: https://www.cofchrist.org/contact/
- Email: info@cofchrist.org
- Phone: +1 (816) 833-1000

**Herald House (Publishing)**:

- Website: https://www.heraldhouse.org/pages/contact-us
- Email: herald@CofChrist.org
- Phone: +1 (800) 767-8181

**World Church Office**:

- Address: 1001 W. Walnut St., Independence, MO 64050
- General Inquiries: info@cofchrist.org

#### 3. Follow-Up Timeline

- Send email request
- Wait 2 weeks for response
- If no response, call phone number
- If declined, proceed to Option 2 or 3

### Option 2: Purchase Official Digital Edition

#### Herald House "D&C 160-165 View Online"

**URL**: https://www.heraldhouse.org/products/doctrine-and-covenants-160-165-view-online

**Steps**:

1. Purchase access to online viewing
2. Carefully transcribe each section:
   - Section 160 (2000)
   - Section 161 (2001)
   - Section 162 (2004)
   - Section 163 (2007) - "Enduring Principles"
   - Section 164 (2010) - Temple Dedication
   - Section 165 (2016) - "Courageous in Christ"
3. Format as JSON following existing structure
4. Add to `coc-dc-sections-114-167.json`
5. Regenerate SQL import script

**JSON Format Template**:

```json
{
  "section": 163,
  "tradition": "coc",
  "prophet_received": "Stephen M. Veazey",
  "date_received": "2007-03-28",
  "conference_date": "2007-04-08",
  "verses": [
    {
      "num": 1,
      "text": "Verse text here..."
    },
    {
      "num": 2,
      "text": "Next verse..."
    }
  ],
  "historical_context": "Enduring Principles revelation. Established core principles of Community of Christ identity..."
}
```

#### Amazon Kindle Editions

Individual sections available as separate eBooks:

- Search "Community of Christ Doctrine and Covenants Section [number]"
- Example: https://www.amazon.com/Doctrine-Covenants-Section-165-ebook/dp/B01KU5FN06
- Purchase, copy text carefully, format as JSON

### Option 3: Physical Book Purchase

#### Complete D&C Edition

**Herald House**:

- Title: "Doctrine and Covenants"
- Complete edition with all 165 sections
- Purchase: https://www.heraldhouse.org

**Steps**:

1. Purchase physical book
2. Manually type sections 160-165
3. Proofread carefully
4. Format as JSON

### Option 4: Community Sourcing

#### Community of Christ Forums/Groups

**Potential Communities**:

- Community of Christ Facebook groups
- Reddit: r/CommunityofChrist
- John Whitmer Historical Association
- Centerplace.org forums

**Request Template**:

```
I'm working on a non-commercial educational scripture study platform
and need help obtaining the text of Community of Christ D&C sections
160-165. Would anyone be willing to share these texts or point me to
a legitimate source where I can obtain them with proper permissions?

Platform info: [describe your project]
```

**Caution**: Verify text accuracy against official sources.

## After Obtaining Text

### 1. Format as JSON

Edit: `/services/api/prisma/seeds/coc-dc-sections-114-167.json`

Add sections 160-165 to the array, maintaining sequential order.

### 2. Add Historical Context

Include for each section:

- Prophet who received it
- Date received
- Conference date
- Historical context/significance

### 3. Regenerate SQL Script

Run the scraper script:

```bash
cd /services/api
npx tsx src/scripts/scrape-coc-dc-114-167.ts
```

Or manually regenerate SQL by running the `generateSQL()` function.

### 4. Test Import

```bash
# Backup database first
pg_dump bom_study_tools_dev > backup.sql

# Test import
psql -d bom_study_tools_dev -f services/api/prisma/seeds/import-coc-dc-sections.sql

# Verify
psql -d bom_study_tools_dev -c "SELECT COUNT(*) FROM doctrine_covenants_verses WHERE tradition = 'coc';"
```

Should show ~450+ verses (365 current + ~85 from sections 160-165).

### 5. Add Attribution

Create attribution notice in the app:

```
Scripture text from:
Doctrine and Covenants of Community of Christ
© Community of Christ
1001 W. Walnut St., Independence, MO 64050
cofchrist.org

Used with permission for educational purposes.
```

## Historical Context to Include

### Section 160 (2000)

```json
{
  "prophet": "W. Grant McMurray",
  "dateReceived": "2000-03-27",
  "conferenceDate": "2000-04-09",
  "context": "Called church to journey of patient faithfulness. Emphasized peace, justice, environmental stewardship, and sacrament of the Lord's Supper."
}
```

### Section 161 (2001)

```json
{
  "prophet": "W. Grant McMurray",
  "dateReceived": "2001-03-27",
  "conferenceDate": "2001-04-08",
  "context": "Provided guidance on faithful discipleship and preparation for temple ministries. Emphasized grace and continuing revelation."
}
```

### Section 162 (2004)

```json
{
  "prophet": "W. Grant McMurray",
  "dateReceived": "2004-03-27",
  "conferenceDate": "2004-04-04",
  "context": "Called church to pursue peace on earth. Last revelation under McMurray's presidency before stepping down later in 2004."
}
```

### Section 163 (2007)

```json
{
  "prophet": "Stephen M. Veazey",
  "dateReceived": "2007-03-28",
  "conferenceDate": "2007-04-08",
  "context": "Enduring Principles revelation. First revelation under Veazey's presidency. Established 8 core principles of Community of Christ identity and mission."
}
```

### Section 164 (2010)

```json
{
  "prophet": "Stephen M. Veazey",
  "dateReceived": "2010-03-28",
  "conferenceDate": "2010-04-10",
  "context": "Temple dedication revelation. Provided specific guidance on Independence Temple purposes: peace, reconciliation, healing, and spiritual formation."
}
```

### Section 165 (2016)

```json
{
  "prophet": "Stephen M. Veazey",
  "dateReceived": "2016-03-28",
  "conferenceDate": "2016-04-10",
  "context": "Latest revelation. Called church to courageously make Jesus Christ the center of individual and community life. Emphasized sharing ministries and generous community."
}
```

## Legal/Copyright Checklist

When obtaining and using the text:

- [ ] Verify text is accurate against official source
- [ ] Add proper copyright attribution
- [ ] Include "Used with permission" if permission granted
- [ ] Link to official cofchrist.org resources
- [ ] Make platform non-commercial
- [ ] Consider adding disclaimer about unofficial nature
- [ ] Respect sacred nature of revelatory texts
- [ ] Keep in sync with official editions if updated

## Quality Assurance

After adding sections 160-165:

- [ ] Verify all verses are sequential (no missing numbers)
- [ ] Check for typos/transcription errors
- [ ] Confirm prophet/date information is accurate
- [ ] Test SQL import completes without errors
- [ ] Verify verse count matches expected totals
- [ ] Test search functionality works
- [ ] Check mobile app can access new sections
- [ ] Proofread historical context descriptions

## Contact for This Project

If you need assistance with this task:

1. Check `/services/api/prisma/seeds/COC_DC_SECTIONS_160-165_SOURCES.md`
2. Review `/services/api/prisma/seeds/COC_DC_SCRAPING_SUMMARY.md`
3. Examine existing sections in JSON file for format examples
4. Test scraper script works with current sections

## Timeline Estimate

- **Option 1 (Permission Request)**: 2-4 weeks
- **Option 2 (Purchase)**: 1-2 days + transcription time
- **Option 3 (Physical Book)**: 1 week shipping + transcription
- **Option 4 (Community)**: Variable, 1-4 weeks

**Recommended**: Start with Option 1 while preparing for Option 2 as backup.

---

**Last Updated**: January 28, 2026
**Status**: Awaiting action to obtain sections 160-165

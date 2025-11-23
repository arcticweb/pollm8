# Data Population System

## Overview

The VoteHub data population system allows administrators and users to import topics from external data sources. The system supports multiple source types and provides intricate control over categorization and tagging.

## Features

### 1. Categories and Tags

- **Hierarchical categories** with icons, colors, and descriptions
- **Flexible tagging system** for topic organization
- **Trust levels**: Admin-assigned categories/tags are "trusted" and shown in public lists
- **User contributions**: Regular users can suggest categories/tags (marked as untrusted)

### 2. Data Sources

Supported source types:
- **API**: RESTful JSON APIs
- **RSS**: RSS/Atom feeds
- **JSON**: Direct JSON file URLs
- **CSV**: CSV file URLs (coming soon)
- **Web Scraper**: HTML page scraping (requires custom configuration)
- **Python Script**: External Python scripts for complex data extraction

### 3. Trust System

- **Trusted sources**: Imports are automatically approved
- **Untrusted sources**: Imports require admin review
- **User submissions**: Any authenticated user can create data sources
- **Admin control**: Full oversight through admin panel

## Admin Panel Access

Navigate to: **Admin Panel > Categories** or **Admin Panel > Data Sources**

### Managing Categories

1. Click "Add Category"
2. Fill in:
   - **Name**: Display name (e.g., "Technology")
   - **Slug**: URL-friendly identifier (e.g., "technology")
   - **Icon**: Emoji or icon name
   - **Color**: Hex color code for visual distinction
   - **Description**: Optional explanation
3. Save and the category becomes available for tagging

### Managing Data Sources

1. Click "Add Data Source"
2. Configure:
   - **Name**: Descriptive identifier
   - **Source Type**: Choose from supported types
   - **Source URL**: API endpoint, RSS feed, or file URL
   - **Sync Frequency**: Manual, hourly, daily, or weekly
   - **Trusted**: Check if imports should be auto-approved
3. Click "Create"
4. Trigger manual import using the Play button

## Data Source Configuration Examples

### RSS Feed Example

```json
{
  "name": "Tech News RSS",
  "source_type": "rss",
  "source_url": "https://example.com/feed.rss",
  "sync_frequency": "daily",
  "is_trusted": true
}
```

### API Example with Field Mapping

```json
{
  "name": "Public Opinion API",
  "source_type": "api",
  "source_url": "https://api.example.com/polls",
  "config": {
    "dataPath": "data.polls",
    "titleField": "question",
    "descriptionField": "summary",
    "headers": {
      "Authorization": "Bearer YOUR_TOKEN"
    }
  },
  "sync_frequency": "hourly",
  "is_trusted": true
}
```

### JSON File Example

```json
{
  "name": "Community Polls JSON",
  "source_type": "json",
  "source_url": "https://example.com/data/polls.json",
  "config": {
    "dataPath": "polls",
    "titleField": "title",
    "descriptionField": "description"
  },
  "sync_frequency": "manual",
  "is_trusted": false
}
```

## Edge Function: import-data

The system uses a Supabase Edge Function to handle data imports asynchronously.

### How It Works

1. User triggers import from admin panel
2. System creates an import record with status "pending"
3. Edge Function processes the import:
   - Fetches data from source
   - Maps fields according to configuration
   - Creates topics with metadata
   - Skips duplicates (checks by source+sourceId)
   - Updates import status and statistics
4. Admin can view import history and results

### Import Statistics

Each import tracks:
- **Topics Imported**: New topics created
- **Topics Updated**: Existing topics modified
- **Topics Skipped**: Duplicates or invalid data
- **Error Message**: Details if import failed

## Python Script Integration

For advanced data extraction, you can integrate Python scripts:

1. Create a Python script that outputs JSON to stdout
2. Host the script on a server or serverless platform
3. Create a data source with type "python_script"
4. Configure the URL to trigger the script
5. The Edge Function will fetch the JSON output

### Example Python Script Output Format

```json
{
  "polls": [
    {
      "id": "unique-id-1",
      "title": "Should we implement feature X?",
      "description": "Community discussion about feature X",
      "categories": ["technology", "community"],
      "tags": ["feature-request", "discussion"]
    }
  ]
}
```

## User Workflow

Regular users can:
1. Create data sources (marked as untrusted)
2. Trigger imports from their own sources
3. Suggest categories and tags for topics
4. View their own import history

Admins can:
1. Review and approve user-submitted sources
2. Mark sources as "trusted" for auto-approval
3. Manage all categories and tags
4. Override or delete any assignments

## API Integration Tips

### Free Data Sources to Consider

- **Government Open Data**: data.gov, census data, public records
- **Academic Datasets**: research.data.gov, academic repositories
- **RSS Feeds**: News sites, blogs, forums
- **Public APIs**: Reddit API, Twitter API (limited), Stack Exchange
- **Wiki Data**: DBpedia, Wikidata SPARQL endpoint
- **Open Polling Data**: FiveThirtyEight, Pew Research Center

### Rate Limiting Considerations

- Set appropriate sync frequencies
- Use caching in Edge Functions
- Monitor import quotas
- Implement exponential backoff for failed imports

## Security Notes

- API keys should be stored in data source config (encrypted at rest)
- Never expose service role keys in client code
- Validate all imported data before insertion
- Sanitize HTML/markdown in descriptions
- Rate limit import triggers per user

## Troubleshooting

### Import Fails Immediately

- Check source URL is accessible
- Verify API authentication
- Review error message in import history

### Duplicate Topics Created

- Ensure source includes unique identifiers
- Check metadata mapping in config
- Review deduplication logic in Edge Function

### Categories Not Appearing

- Verify category is marked as "active"
- Check category assignments are "trusted" for public display
- Ensure proper permissions are set

## Future Enhancements

- CSV/Excel file uploads
- Scheduled imports with cron-like syntax
- Webhook receivers for push-based updates
- Advanced field mapping UI
- Bulk category/tag assignment tools
- Import preview before applying
- Rollback capability for failed imports

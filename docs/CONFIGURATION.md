# VoteHub Configuration Reference

Complete guide to configuring VoteHub for your needs.

## Table of Contents

1. [Application Configuration](#application-configuration)
2. [Vote Type Configuration](#vote-type-configuration)
3. [Theme Configuration](#theme-configuration)
4. [Language Configuration](#language-configuration)
5. [Environment Variables](#environment-variables)
6. [Database Configuration](#database-configuration)
7. [Analytics Configuration](#analytics-configuration)
8. [Notification Configuration](#notification-configuration)

## Application Configuration

Location: `src/config/app.config.ts`

### Complete Configuration Object

```typescript
export const APP_CONFIG = {
  // Application metadata
  app: {
    name: 'VoteHub',
    tagline: 'Know What Everyone Thinks About Anything',
    description: 'Poll your family, friends, or the entire planet',
    version: '1.0.0',
  },

  // Feature flags
  features: {
    enableVerification: true,       // User verification system
    enableDemographics: true,        // Demographic data collection
    enableAnalytics: true,           // Analytics tracking
    enableNotifications: true,       // Notification system
    enableAPI: true,                 // API access
    enableSimilarityDetection: true, // Topic similarity checking
  },

  // Voting behavior
  voting: {
    allowVoteChanges: true,                 // Can users change votes
    defaultVoteExpiry: null,                // Default expiration (null = never)
    requireVerificationForSensitiveTopics: false,
  },

  // UI configuration
  ui: {
    defaultTheme: 'votelight',     // Default theme name
    darkTheme: 'votedark',         // Dark mode theme
    enableThemeSwitcher: true,     // Show theme selector
    enableAccessibilityFeatures: true,
    defaultFontSize: 16,           // Base font size (px)
    fontSizeRange: { min: 12, max: 24 },
  },

  // Notification defaults
  notifications: {
    channels: ['email', 'webhook', 'sms'],
    defaultPreferences: {
      topicCreatedOnMine: true,
      topicTrending: false,
      verificationStatus: true,
      similarTopicSuggested: true,
      weeklySummary: false,
    },
  },

  // Analytics providers
  analytics: {
    providers: {
      google: {
        enabled: true,
        measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || '',
      },
    },
  },

  // API settings
  api: {
    version: 'v1',
    baseUrl: '/api',
    rateLimit: {
      enabled: true,
      maxRequests: 100,    // Requests per window
      windowMs: 60000,     // Time window (ms)
    },
  },

  // Similarity detection
  similarity: {
    threshold: 0.7,        // Similarity score threshold (0-1)
    method: 'manual',      // 'manual' or 'ai'
    enableAI: false,       // Use AI for similarity detection
  },
};
```

### Modifying Configuration

To change any setting, edit `src/config/app.config.ts`:

```typescript
// Example: Disable vote changes
voting: {
  allowVoteChanges: false,  // Changed from true
  // ...
}

// Example: Change default theme
ui: {
  defaultTheme: 'dark',     // Changed from 'votelight'
  // ...
}
```

After modifying, rebuild the application:
```bash
npm run build
```

## Vote Type Configuration

Vote types are stored in the database and can be modified through SQL or the application.

### Default Vote Types

#### 1. Yes/No

```json
{
  "name": "yes_no",
  "display_name": "Yes/No",
  "description": "Simple yes or no question",
  "config_schema": {
    "type": "object",
    "properties": {
      "allow_abstain": { "type": "boolean" }
    }
  },
  "default_config": {
    "allow_abstain": false
  }
}
```

#### 2. Multiple Choice

```json
{
  "name": "multiple_choice",
  "display_name": "Multiple Choice",
  "description": "Choose one or more options from a list",
  "config_schema": {
    "type": "object",
    "properties": {
      "options": { "type": "array" },
      "allow_multiple": { "type": "boolean" },
      "max_selections": { "type": "number" }
    }
  },
  "default_config": {
    "options": [],
    "allow_multiple": false,
    "max_selections": 1
  }
}
```

#### 3. Rating Scale

```json
{
  "name": "rating",
  "display_name": "Rating Scale",
  "description": "Rate on a numeric scale",
  "config_schema": {
    "type": "object",
    "properties": {
      "min_value": { "type": "number" },
      "max_value": { "type": "number" },
      "step": { "type": "number" },
      "labels": { "type": "object" }
    }
  },
  "default_config": {
    "min_value": 1,
    "max_value": 5,
    "step": 1,
    "labels": {}
  }
}
```

#### 4. Open Ended

```json
{
  "name": "open_ended",
  "display_name": "Open Ended",
  "description": "Free-form text response",
  "config_schema": {
    "type": "object",
    "properties": {
      "max_length": { "type": "number" },
      "allow_empty": { "type": "boolean" }
    }
  },
  "default_config": {
    "max_length": 500,
    "allow_empty": false
  }
}
```

### Adding Custom Vote Types

Create a new migration:

```sql
INSERT INTO vote_type_configs (
  name,
  display_name,
  description,
  config_schema,
  default_config,
  is_active
) VALUES (
  'ranked_choice',
  'Ranked Choice',
  'Rank options in order of preference',
  '{"type": "object", "properties": {"options": {"type": "array"}, "min_selections": {"type": "number"}}}'::jsonb,
  '{"options": [], "min_selections": 3}'::jsonb,
  true
);
```

Then update the frontend to handle the new vote type in:
- `src/pages/TopicDetailPage.tsx` (voting form)
- `src/services/voteService.ts` (result aggregation)

## Theme Configuration

Location: `tailwind.config.js`

### Custom Themes

The application includes two custom themes with blue primary and red secondary colors:

```javascript
{
  votelight: {
    'primary': '#3b82f6',      // Blue
    'secondary': '#ef4444',    // Red
    'accent': '#06b6d4',       // Cyan
    'neutral': '#1f2937',      // Dark gray
    'base-100': '#ffffff',     // White background
    // ...
  },
  votedark: {
    'primary': '#60a5fa',      // Light blue
    'secondary': '#f87171',    // Light red
    'accent': '#22d3ee',       // Light cyan
    'base-100': '#1f2937',     // Dark background
    // ...
  }
}
```

### Adding New Themes

1. Edit `tailwind.config.js`:

```javascript
daisyui: {
  themes: [
    {
      mytheme: {
        'primary': '#your-color',
        'secondary': '#your-color',
        // ... define all colors
      },
    },
    // ... existing themes
  ],
}
```

2. Update `src/contexts/ThemeContext.tsx`:

```typescript
const AVAILABLE_THEMES = [
  'mytheme',  // Add your theme
  'votelight',
  'votedark',
  // ...
];
```

### Theme Colors Reference

Required colors for each theme:
- `primary` - Main brand color
- `primary-content` - Text on primary background
- `secondary` - Secondary brand color
- `secondary-content` - Text on secondary background
- `accent` - Accent highlights
- `accent-content` - Text on accent background
- `neutral` - Neutral elements
- `neutral-content` - Text on neutral background
- `base-100` - Page background
- `base-200` - Container background
- `base-300` - Borders and dividers
- `base-content` - Body text color
- `info` - Info messages
- `success` - Success messages
- `warning` - Warning messages
- `error` - Error messages

## Language Configuration

Location: `src/config/language.config.ts`

### Current Languages

```typescript
export const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    direction: 'ltr',
  },
};

export const DEFAULT_LANGUAGE = 'en';
```

### Adding New Languages

1. Add language to `LANGUAGES` object:

```typescript
export const LANGUAGES = {
  en: { code: 'en', name: 'English', direction: 'ltr' },
  es: { code: 'es', name: 'Español', direction: 'ltr' },
  ar: { code: 'ar', name: 'العربية', direction: 'rtl' },
};
```

2. Add translations:

```typescript
export const TRANSLATIONS = {
  en: { /* English translations */ },
  es: {
    common: {
      appName: 'VoteHub',
      loading: 'Cargando...',
      error: 'Error',
      // ... all other translations
    },
    // ... all sections
  },
};
```

3. Add language selector to UI (in Header component):

```typescript
<select
  value={currentLanguage}
  onChange={(e) => setLanguage(e.target.value)}
>
  {Object.entries(LANGUAGES).map(([code, lang]) => (
    <option key={code} value={code}>{lang.name}</option>
  ))}
</select>
```

## Environment Variables

Location: `.env` file

### Required Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Optional Variables

```env
# Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Feature Flags (override config)
VITE_ENABLE_VERIFICATION=true
VITE_ENABLE_DEMOGRAPHICS=true

# API Configuration
VITE_API_BASE_URL=https://api.votehub.com
VITE_API_VERSION=v1

# Development
VITE_DEBUG_MODE=true
VITE_MOCK_DATA=false
```

### Environment-Specific Configurations

#### Development (`.env.development`)
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=local-dev-key
VITE_DEBUG_MODE=true
```

#### Production (`.env.production`)
```env
VITE_SUPABASE_URL=https://prod.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key
VITE_GA_MEASUREMENT_ID=G-PRODUCTION
```

## Database Configuration

### Connection Settings

Configured in Supabase dashboard:
- **Connection pooling**: Enable for production
- **Max connections**: Adjust based on traffic
- **Statement timeout**: 60 seconds recommended
- **Idle timeout**: 300 seconds recommended

### RLS Policies

Review and adjust RLS policies in database:

```sql
-- Example: Make topics publicly readable
CREATE POLICY "Anyone can view active topics"
  ON topics FOR SELECT
  TO anon, authenticated  -- Changed from authenticated only
  USING (is_active = true);
```

### Performance Settings

Add indexes for frequently queried columns:

```sql
-- Example: Add index for topic search
CREATE INDEX idx_topics_title_search
  ON topics USING gin(to_tsvector('english', title));
```

### Backup Configuration

Configure in Supabase dashboard:
- **Point-in-time recovery**: Enable for production
- **Backup frequency**: Daily recommended
- **Retention period**: 30 days minimum

## Analytics Configuration

### Google Analytics

1. Create GA4 property
2. Get Measurement ID (format: `G-XXXXXXXXXX`)
3. Add to `.env`:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

4. Verify configuration:

```typescript
// In app.config.ts
analytics: {
  providers: {
    google: {
      enabled: true,  // Must be true
      measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID,
    },
  },
}
```

### Custom Events

Track custom events in `analyticsService.ts`:

```typescript
// Add new tracking method
trackCustomEvent(name: string, data?: Record<string, any>) {
  this.trackEvent('custom', name, data);
}
```

### Event Categories

Current categories:
- `page_view` - Page navigation
- `topic` - Topic interactions
- `vote` - Voting actions
- `auth` - Authentication events
- `search` - Search queries
- `settings` - Settings changes

## Notification Configuration

### Email Configuration

1. Set up email provider (SendGrid, Mailgun, etc.)
2. Create Supabase Edge Function for email sending
3. Configure SMTP settings in Supabase secrets

### Webhook Configuration

Users can add webhook URLs in their settings:

```typescript
{
  channel_type: 'webhook',
  channel_config: {
    url: 'https://example.com/webhook',
    secret: 'webhook-secret-key',
    events: ['vote.cast', 'topic.created'],
    headers: {
      'Content-Type': 'application/json',
      'X-Custom-Header': 'value',
    },
  },
}
```

### SMS Configuration

1. Sign up for Twilio or similar
2. Add credentials to Supabase secrets
3. Create Edge Function for SMS sending
4. Enable SMS channel in notification preferences

## Security Configuration

### Rate Limiting

Configure in `app.config.ts`:

```typescript
api: {
  rateLimit: {
    enabled: true,
    maxRequests: 100,  // Adjust based on needs
    windowMs: 60000,   // 1 minute
  },
}
```

### CORS Settings

Configure in Supabase dashboard under API settings:
- **Allowed origins**: Add your domain(s)
- **Allowed methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed headers**: Content-Type, Authorization, X-Client-Info

### Content Security Policy

Add to `index.html`:

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' https://www.googletagmanager.com;
               connect-src 'self' https://*.supabase.co;
               img-src 'self' data: https:;
               style-src 'self' 'unsafe-inline';">
```

## PWA Configuration

Location: `public/manifest.json`

### Manifest Settings

```json
{
  "name": "VoteHub - Know What Everyone Thinks",
  "short_name": "VoteHub",
  "theme_color": "#3b82f6",      // Match primary color
  "background_color": "#ffffff",  // Match base-100
  "display": "standalone",
  "start_url": "/",
  "scope": "/",
  "orientation": "portrait-primary"
}
```

### Service Worker

Configure cache strategy in `public/service-worker.js`:

```javascript
const CACHE_NAME = 'votehub-v1';  // Increment on updates
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add other static assets
];
```

## Performance Configuration

### Build Optimization

In `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: false,  // Disable for production
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
});
```

### Image Optimization

1. Use WebP format for images
2. Implement lazy loading
3. Use responsive images with srcset

### Code Splitting

Already configured - pages are automatically split into separate chunks.

## Monitoring Configuration

### Error Tracking

Integrate Sentry or similar:

```typescript
// In main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
});
```

### Performance Monitoring

```typescript
// Track performance metrics
const perfObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    analyticsService.trackEvent('performance', entry.name, {
      duration: entry.duration,
    });
  }
});
perfObserver.observe({ entryTypes: ['measure'] });
```

## Troubleshooting

### Configuration Not Applied

1. Restart development server
2. Clear browser cache
3. Rebuild application: `npm run build`
4. Check browser console for errors

### Database Configuration Issues

1. Verify RLS policies in Supabase dashboard
2. Check migration logs
3. Test queries in Supabase SQL editor
4. Review error logs in Supabase

### Theme Not Changing

1. Check localStorage: `localStorage.getItem('theme')`
2. Verify theme name in `AVAILABLE_THEMES` array
3. Inspect HTML `data-theme` attribute
4. Clear browser cache

---

For additional configuration help, refer to:
- [Setup Guide](./SETUP.md)
- [API Documentation](./API.md)
- [README](../README.md)
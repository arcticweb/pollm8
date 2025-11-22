# VoteHub - Universal Voting Platform

**Know What Everyone Thinks About Anything**

VoteHub is a comprehensive voting and polling platform that enables anyone to create surveys, gather opinions, and discover insights from any audience - from family polls to verified demographic research.

## Features

### Core Functionality
- **Multiple Vote Types**: Yes/No, Multiple Choice, Rating Scales, and Open-ended responses
- **Real-time Results**: Live vote tracking with instant visualizations
- **User Authentication**: Secure account creation and management
- **Profile System**: Optional demographic information for verified data analysis
- **Topic Management**: Create, browse, and search voting topics
- **Smart Similarity Detection**: Suggests similar topics to prevent duplication
- **Verification System**: Multi-level user verification (email, phone, ID, full)

### Technical Features
- **API-Driven Architecture**: RESTful API for all data operations
- **Real-time Updates**: Powered by Supabase Realtime
- **Progressive Web App**: Works on any device, installable on mobile
- **Theme System**: 30+ themes with custom blue/red primary theme
- **Accessibility**: Font scaling, high contrast, keyboard navigation
- **Analytics Integration**: Google Analytics + custom event tracking
- **Notification System**: Email, webhook, and SMS support (configurable)
- **Responsive Design**: Optimized for smartwatch to desktop

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd votehub
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GA_MEASUREMENT_ID=your_google_analytics_id (optional)
```

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Project Structure

```
votehub/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── auth/         # Authentication components
│   │   └── layout/       # Layout components (Header, Footer)
│   ├── contexts/         # React contexts (Auth, Theme)
│   ├── services/         # Business logic services
│   │   ├── topicService.ts
│   │   ├── voteService.ts
│   │   └── analyticsService.ts
│   ├── pages/            # Page components
│   │   ├── LandingPage.tsx
│   │   ├── TopicsPage.tsx
│   │   ├── CreateTopicPage.tsx
│   │   └── TopicDetailPage.tsx
│   ├── config/           # Configuration files
│   │   ├── app.config.ts
│   │   └── language.config.ts
│   ├── types/            # TypeScript type definitions
│   ├── lib/              # Library initialization
│   └── App.tsx           # Main application component
├── public/               # Static assets
│   ├── manifest.json     # PWA manifest
│   └── service-worker.js # Service worker for offline support
├── supabase/
│   └── migrations/       # Database migrations
└── docs/                 # Documentation
    ├── user/             # User-facing documentation
    └── development/      # Developer documentation
```

## Database Schema

The platform uses Supabase (PostgreSQL) with the following main tables:

- **profiles**: User profiles and verification status
- **profile_demographics**: Optional demographic data
- **topics**: Voting topics/questions
- **votes**: Individual votes cast by users
- **vote_type_configs**: Configurable vote type definitions
- **vote_results_cache**: Aggregated results for performance
- **topic_similarity_suggestions**: AI/manual topic similarity tracking
- **notification_channels**: User notification preferences
- **notification_preferences**: Notification settings
- **analytics_events**: Event tracking
- **api_keys**: API access management

All tables have Row Level Security (RLS) enabled for data protection.

## Configuration

### App Configuration (`src/config/app.config.ts`)

The application uses a centralized configuration system:

```typescript
export const APP_CONFIG = {
  app: {
    name: 'VoteHub',
    version: '1.0.0',
  },
  features: {
    enableVerification: true,
    enableDemographics: true,
    enableAnalytics: true,
    // ... more feature flags
  },
  voting: {
    allowVoteChanges: true,
    defaultVoteExpiry: null,
  },
  ui: {
    defaultTheme: 'votelight',
    darkTheme: 'votedark',
  },
  // ... more configuration
};
```

### Vote Type Configuration

Vote types are stored in the database and fully configurable:

- **Yes/No**: Simple binary choice
- **Multiple Choice**: Select from predefined options
- **Rating Scale**: Numeric rating (configurable min/max/step)
- **Open Ended**: Free-form text responses

Each vote type has a JSON schema and default configuration that can be customized per topic.

### Language Configuration (`src/config/language.config.ts`)

All user-facing text is centralized in the language configuration file, making translation straightforward:

```typescript
export const TRANSLATIONS = {
  en: {
    common: { /* common translations */ },
    auth: { /* auth translations */ },
    topics: { /* topic translations */ },
    // ... more sections
  },
};
```

To add a new language:
1. Add language code to `LANGUAGES` object
2. Create translation object under `TRANSLATIONS[languageCode]`
3. Update UI to allow language selection

## Theme System

The application uses DaisyUI with 30+ built-in themes plus two custom themes:

- **votelight**: Custom blue and red theme (light mode)
- **votedark**: Custom blue and red theme (dark mode)

Users can switch themes via the settings menu. Theme preference is persisted to localStorage.

### Accessibility

- Font size adjustment (12px - 24px)
- High contrast themes available
- Keyboard navigation support
- ARIA labels on interactive elements
- Semantic HTML structure

## API Usage

All data operations are available through service modules:

### Topic Service
```typescript
import { topicService } from './services/topicService';

// Create topic
const topic = await topicService.createTopic({
  title: 'Your question?',
  vote_type_id: 'uuid',
  // ...
});

// Get topics
const topics = await topicService.getTopics({
  search: 'query',
  orderBy: 'vote_count',
  limit: 10,
});
```

### Vote Service
```typescript
import { voteService } from './services/voteService';

// Cast vote
await voteService.castVote(topicId, userId, {
  answer: 'yes'
});

// Get results
const results = await voteService.getResults(topicId);
```

## Analytics

The platform tracks:
- Page views
- Topic creation and views
- Vote casting and changes
- User authentication events
- Search queries
- Theme changes

Events are stored in the database and optionally sent to Google Analytics.

## Notification System

Users can configure notification channels:
- **Email**: Standard email notifications
- **Webhook**: POST requests to custom URLs
- **SMS**: Text message notifications (requires integration)

Notification preferences include:
- New votes on your topics
- Trending topics
- Verification status updates
- Similar topic suggestions
- Weekly summaries

## Security

### Row Level Security (RLS)

All database tables use Supabase RLS policies:
- Users can only read/write their own data
- Public read access for active topics and results
- Verified users have additional permissions
- Admin access via app_metadata

### Authentication

- Email/password authentication via Supabase Auth
- Session management with automatic token refresh
- Profile creation on signup
- Secure password requirements (min 6 characters)

### API Keys

Users can generate API keys for programmatic access:
- Scoped permissions
- Expiration dates
- Usage tracking
- Revocation support

## Future Enhancements

### Planned Features
- **AI-Powered Similarity Detection**: Automatic topic linking using NLP
- **Advanced Demographics**: More demographic fields and verification
- **Social Authentication**: Google, Facebook, Twitter login
- **Email Confirmation**: Optional email verification on signup
- **Rich Text Editor**: Formatted descriptions with images
- **Topic Categories**: Organize topics by category/tags
- **Private Polls**: Invitation-only voting topics
- **Export Formats**: CSV, PDF, Excel exports
- **Data Visualization**: Charts and graphs for results
- **Mobile Apps**: Native iOS and Android applications

### Integration Recommendations

#### Notification Services
- **SendGrid** or **Mailgun**: Email delivery
- **Twilio**: SMS notifications
- **Zapier**: Webhook automation

#### AI Services (for similarity detection)
- **OpenAI GPT-4**: Semantic similarity
- **Cohere**: Text embeddings
- **Hugging Face**: Open-source NLP models

#### Analytics
- **Mixpanel**: Advanced user analytics
- **Amplitude**: Product analytics
- **PostHog**: Open-source analytics

#### Storage
- **Supabase Storage**: File uploads (avatars, images)
- **Cloudinary**: Image optimization and CDN

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
```

### Adding New Vote Types

1. Add vote type configuration to database:
```sql
INSERT INTO vote_type_configs (name, display_name, description, config_schema, default_config)
VALUES (
  'new_type',
  'New Type',
  'Description',
  '{"type": "object", "properties": {...}}',
  '{"default": "config"}'
);
```

2. Update vote form in `TopicDetailPage.tsx`
3. Update results display in `ResultsDisplay` component
4. Update vote aggregation in `voteService.ts`

### Database Migrations

Migrations are managed through Supabase:

```sql
-- Migration template
/*
  # Migration Title

  1. Changes
    - Description of changes

  2. Security
    - RLS policies
*/

-- SQL statements here
```

## Documentation

Comprehensive documentation is available:

- **User Guide**: `/docs/user/` - End-user documentation
- **Developer Guide**: `/docs/development/` - Technical documentation
- **API Reference**: `/docs/api/` - API documentation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- Follow existing code style (ESLint configuration)
- Write descriptive commit messages
- Add comments for complex logic
- Update documentation for new features
- Ensure all tests pass before submitting

## License

Copyright © 2024 VoteHub. All rights reserved.

## Support

For questions or support:
- Email: support@votehub.com
- Documentation: /docs/
- Issues: GitHub Issues

---

**VoteHub** - Poll your family, friends, or the entire planet.
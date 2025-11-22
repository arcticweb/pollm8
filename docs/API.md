# VoteHub API Documentation

VoteHub provides a comprehensive API for all voting operations. All API calls go through Supabase's auto-generated REST API and real-time subscriptions.

## Authentication

All API requests require authentication via Supabase JWT tokens.

### Get Authentication Token

```typescript
import { supabase } from './lib/supabase';

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Token is automatically handled by the client
const token = data.session?.access_token;
```

### Using the Token

The Supabase client automatically includes the token in all requests. For external API calls:

```bash
curl https://your-project.supabase.co/rest/v1/topics \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## API Endpoints

### Topics

#### List Topics

```typescript
const { data, error } = await supabase
  .from('topics')
  .select(`
    *,
    vote_type:vote_type_configs(display_name),
    creator:profiles(username, avatar_url, is_verified)
  `)
  .eq('is_active', true)
  .order('created_at', { ascending: false })
  .limit(20);
```

**Query Parameters:**
- `is_active`: Filter by active status (boolean)
- `created_by`: Filter by creator ID (uuid)
- `order`: Sort field (created_at, vote_count, view_count)
- `limit`: Max results (default: 50)

#### Get Topic by ID

```typescript
const { data, error } = await supabase
  .from('topics')
  .select(`
    *,
    vote_type:vote_type_configs(*),
    creator:profiles(*)
  `)
  .eq('id', topicId)
  .single();
```

#### Create Topic

```typescript
const { data, error } = await supabase
  .from('topics')
  .insert({
    title: 'What is your favorite programming language?',
    description: 'Choose your favorite language for web development',
    vote_type_id: 'uuid-of-multiple-choice-type',
    vote_config: {
      options: ['JavaScript', 'Python', 'TypeScript', 'Ruby', 'Go'],
      allow_multiple: false,
    },
    require_verification: false,
    created_by: userId,
  })
  .select()
  .single();
```

**Required Fields:**
- `title` (string): Topic question
- `vote_type_id` (uuid): Reference to vote type
- `created_by` (uuid): User ID

**Optional Fields:**
- `description` (string): Additional context
- `vote_config` (jsonb): Type-specific configuration
- `require_verification` (boolean): Verified users only
- `min_verification_level` (string): Minimum verification level
- `expires_at` (timestamp): Expiration date

#### Update Topic

```typescript
const { data, error } = await supabase
  .from('topics')
  .update({
    title: 'Updated title',
    is_active: false,
  })
  .eq('id', topicId)
  .eq('created_by', userId) // Only creator can update
  .select()
  .single();
```

#### Search Topics

```typescript
const { data, error } = await supabase
  .from('topics')
  .select('*')
  .ilike('title', `%${searchQuery}%`)
  .eq('is_active', true)
  .limit(10);
```

### Votes

#### Cast Vote

```typescript
const { data, error } = await supabase
  .from('votes')
  .upsert(
    {
      topic_id: topicId,
      profile_id: userId,
      vote_data: { answer: 'yes' }, // Format depends on vote type
      is_verified_vote: isVerified,
      verification_level: 'email',
    },
    {
      onConflict: 'topic_id,profile_id', // Update if vote exists
    }
  )
  .select()
  .single();
```

**Vote Data Formats:**

**Yes/No:**
```json
{ "answer": "yes" }  // or "no"
```

**Multiple Choice:**
```json
{ "choice": "Option 1" }
```

**Rating:**
```json
{ "rating": 5 }  // Number between min and max
```

**Open Ended:**
```json
{ "response": "Free text response here" }
```

#### Get User's Vote

```typescript
const { data, error } = await supabase
  .from('votes')
  .select('*')
  .eq('topic_id', topicId)
  .eq('profile_id', userId)
  .single();
```

#### Get Topic Votes (Admin/Creator Only)

```typescript
const { data, error } = await supabase
  .from('votes')
  .select('*')
  .eq('topic_id', topicId);
```

### Results

#### Get Aggregated Results

```typescript
const { data, error } = await supabase
  .from('vote_results_cache')
  .select('*')
  .eq('topic_id', topicId)
  .single();
```

**Response Format:**
```json
{
  "topic_id": "uuid",
  "all_votes": {
    "yes": 150,
    "no": 75
  },
  "verified_votes": {
    "yes": 100,
    "no": 50
  },
  "demographic_breakdown": {
    "by_age": {
      "18-24": 50,
      "25-34": 75,
      "35-44": 60
    },
    "by_gender": {
      "male": 100,
      "female": 125
    }
  },
  "vote_count_all": 225,
  "vote_count_verified": 150,
  "last_calculated": "2024-01-15T10:30:00Z"
}
```

### Profiles

#### Get Profile

```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

#### Update Profile

```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({
    username: 'newusername',
    bio: 'Updated bio',
    avatar_url: 'https://example.com/avatar.jpg',
  })
  .eq('id', userId)
  .select()
  .single();
```

#### Update Demographics

```typescript
const { data, error } = await supabase
  .from('profile_demographics')
  .upsert({
    profile_id: userId,
    age_range: '25-34',
    gender: 'prefer-not-to-say',
    location_country: 'US',
    location_region: 'California',
  })
  .select()
  .single();
```

### Vote Types

#### List Available Vote Types

```typescript
const { data, error } = await supabase
  .from('vote_type_configs')
  .select('*')
  .eq('is_active', true);
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "yes_no",
    "display_name": "Yes/No",
    "description": "Simple yes or no question",
    "config_schema": {},
    "default_config": { "allow_abstain": false }
  }
]
```

### Analytics

#### Track Event

```typescript
const { data, error } = await supabase
  .from('analytics_events')
  .insert({
    profile_id: userId,
    event_type: 'vote',
    event_name: 'vote_cast',
    event_data: {
      topic_id: topicId,
      vote_type: 'yes_no',
    },
    session_id: sessionId,
    page_url: window.location.href,
  });
```

#### Get User Analytics

```typescript
const { data, error } = await supabase
  .from('analytics_events')
  .select('*')
  .eq('profile_id', userId)
  .order('created_at', { ascending: false })
  .limit(100);
```

## Real-time Subscriptions

### Subscribe to Topic Updates

```typescript
const channel = supabase
  .channel('topic-updates')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'topics',
      filter: `id=eq.${topicId}`,
    },
    (payload) => {
      console.log('Topic updated:', payload);
    }
  )
  .subscribe();

// Unsubscribe when done
channel.unsubscribe();
```

### Subscribe to New Votes

```typescript
const channel = supabase
  .channel('new-votes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'votes',
      filter: `topic_id=eq.${topicId}`,
    },
    (payload) => {
      console.log('New vote:', payload);
      // Refresh results
    }
  )
  .subscribe();
```

### Subscribe to Results Updates

```typescript
const channel = supabase
  .channel('results-updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'vote_results_cache',
      filter: `topic_id=eq.${topicId}`,
    },
    (payload) => {
      console.log('Results updated:', payload.new);
    }
  )
  .subscribe();
```

## Rate Limits

Default rate limits (configurable in `app.config.ts`):
- **API Calls**: 100 requests per minute per user
- **Topic Creation**: 10 topics per hour per user
- **Votes**: 1 vote per topic per user (can be updated)

## Error Handling

All API responses follow this pattern:

```typescript
interface Response<T> {
  data: T | null;
  error: {
    message: string;
    code: string;
    details?: string;
    hint?: string;
  } | null;
}
```

**Common Error Codes:**
- `PGRST116`: Row not found
- `23505`: Unique constraint violation
- `42501`: Insufficient privileges
- `23503`: Foreign key violation

**Example Error Handling:**

```typescript
const { data, error } = await supabase
  .from('topics')
  .insert(newTopic);

if (error) {
  switch (error.code) {
    case '23505':
      console.error('Topic already exists');
      break;
    case '42501':
      console.error('Permission denied');
      break;
    default:
      console.error('Unknown error:', error.message);
  }
  return;
}

// Success
console.log('Topic created:', data);
```

## Pagination

```typescript
// Page 1 (0-19)
const { data, error } = await supabase
  .from('topics')
  .select('*')
  .range(0, 19);

// Page 2 (20-39)
const { data: page2, error: error2 } = await supabase
  .from('topics')
  .select('*')
  .range(20, 39);
```

## Filtering

### Basic Filters

```typescript
// Equal
.eq('status', 'active')

// Not equal
.neq('status', 'deleted')

// Greater than
.gt('vote_count', 100)

// Less than
.lt('created_at', '2024-01-01')

// In list
.in('status', ['active', 'pending'])

// Like (case sensitive)
.like('title', '%poll%')

// iLike (case insensitive)
.ilike('title', '%poll%')
```

### Combining Filters

```typescript
const { data, error } = await supabase
  .from('topics')
  .select('*')
  .eq('is_active', true)
  .gt('vote_count', 10)
  .order('created_at', { ascending: false })
  .limit(20);
```

## Sorting

```typescript
// Ascending
.order('created_at', { ascending: true })

// Descending
.order('vote_count', { ascending: false })

// Multiple sorts
.order('vote_count', { ascending: false })
.order('created_at', { ascending: false })
```

## Joins

```typescript
// Inner join
const { data, error } = await supabase
  .from('topics')
  .select(`
    *,
    votes(count)
  `)
  .eq('votes.profile_id', userId);

// Left join
const { data, error } = await supabase
  .from('profiles')
  .select(`
    *,
    topics(*)
  `);
```

## Batch Operations

### Bulk Insert

```typescript
const { data, error } = await supabase
  .from('votes')
  .insert([
    { topic_id: id1, profile_id: userId, vote_data: { answer: 'yes' } },
    { topic_id: id2, profile_id: userId, vote_data: { answer: 'no' } },
  ]);
```

### Bulk Update

```typescript
const { data, error } = await supabase
  .from('topics')
  .update({ is_active: false })
  .in('id', [id1, id2, id3]);
```

## Export Data

### Export Topics

```typescript
const { data, error } = await supabase
  .from('topics')
  .select('*')
  .eq('created_by', userId)
  .csv(); // Returns CSV format
```

### Export Votes

```typescript
const { data, error } = await supabase
  .from('votes')
  .select('*, topic:topics(title)')
  .eq('profile_id', userId)
  .csv();
```

## Webhooks

Configure webhooks for real-time notifications:

```typescript
// In notification_channels table
const { data, error } = await supabase
  .from('notification_channels')
  .insert({
    profile_id: userId,
    channel_type: 'webhook',
    channel_config: {
      url: 'https://your-endpoint.com/webhook',
      secret: 'your-webhook-secret',
      events: ['vote.cast', 'topic.created'],
    },
  });
```

**Webhook Payload:**
```json
{
  "event": "vote.cast",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "topic_id": "uuid",
    "vote_id": "uuid",
    "user_id": "uuid"
  },
  "signature": "hmac-sha256-signature"
}
```

## Best Practices

1. **Use connection pooling** for high-traffic applications
2. **Cache frequently accessed data** (vote results, topic lists)
3. **Implement retry logic** for failed requests
4. **Use real-time subscriptions** instead of polling
5. **Validate input** on both client and server
6. **Handle errors gracefully** with user-friendly messages
7. **Use indexes** for frequently queried fields
8. **Batch operations** when possible to reduce API calls
9. **Monitor usage** with analytics events
10. **Test with rate limits** enabled

## SDK Examples

### JavaScript/TypeScript
See examples above using `@supabase/supabase-js`

### Python
```python
from supabase import create_client, Client

supabase: Client = create_client(supabase_url, supabase_key)

# Get topics
response = supabase.table('topics').select("*").eq('is_active', True).execute()
```

### cURL
```bash
curl -X POST 'https://your-project.supabase.co/rest/v1/votes' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "topic_id": "uuid",
    "profile_id": "uuid",
    "vote_data": {"answer": "yes"}
  }'
```

## Support

For API issues or questions:
- Check [Supabase Documentation](https://supabase.com/docs)
- Review [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- Submit issues on GitHub
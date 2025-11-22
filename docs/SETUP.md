# VoteHub Setup Guide

This guide will walk you through setting up VoteHub for development or production.

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- A Supabase account (free tier available)
- Optional: Google Analytics account

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd votehub

# Install dependencies
npm install
```

## Step 2: Supabase Setup

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Project Name**: VoteHub (or your choice)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users

### Get Your Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

### Run Database Migrations

The migration has already been applied when you set up the project. The database schema includes:

- User profiles and authentication
- Topics and voting system
- Analytics and notifications
- Results caching

All tables have Row Level Security (RLS) enabled for data protection.

## Step 3: Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Google Analytics (OPTIONAL)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Important Notes

- Never commit the `.env` file to version control
- The `.env.example` file should contain placeholder values only
- All environment variables starting with `VITE_` are exposed to the browser

## Step 4: Verify Setup

### Run Type Checking

```bash
npm run typecheck
```

This should complete without errors.

### Start Development Server

```bash
npm run dev
```

The application should open at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The build should complete successfully, creating a `dist/` folder.

## Step 5: Initial Configuration

### Create Your First Account

1. Open the application
2. Click "Sign Up"
3. Enter email, username, and password
4. You'll be automatically signed in

### Test the System

1. **Create a Topic**:
   - Click "Create Topic"
   - Enter a question
   - Select vote type
   - Submit

2. **Cast a Vote**:
   - Click on your topic
   - Submit your vote
   - View real-time results

3. **Test Theme Switching**:
   - Click the settings icon in header
   - Try different themes
   - Your preference is saved

## Common Issues and Solutions

### Issue: "Missing Supabase environment variables"

**Solution**: Ensure your `.env` file exists and contains valid values:
```bash
# Check if .env exists
ls -la .env

# Verify contents (don't share these publicly!)
cat .env
```

### Issue: Database errors or "relation does not exist"

**Solution**: The migration should have been applied automatically. Verify in Supabase:
1. Go to Supabase Dashboard
2. Click "Database" > "Migrations"
3. Confirm `create_voting_system_schema` is listed

### Issue: "Cannot find module 'daisyui'"

**Solution**: Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Build fails with TypeScript errors

**Solution**: Run type checking to see specific errors:
```bash
npm run typecheck
```

Common fixes:
- Update TypeScript definitions: `npm install --save-dev @types/node`
- Clear build cache: `rm -rf dist .vite`

## Production Deployment

### Recommended Platforms

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Environment variables to set in Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GA_MEASUREMENT_ID` (optional)

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

#### Self-Hosted (Docker)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-p", "3000"]
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] HTTPS enabled (required for PWA)
- [ ] Google Analytics configured (optional)
- [ ] Supabase RLS policies verified
- [ ] Error tracking configured (optional)
- [ ] CDN configured for static assets (optional)
- [ ] Backup strategy for database

## Optional Enhancements

### Enable Email Notifications

1. Configure an email service (SendGrid, Mailgun, etc.)
2. Create a Supabase Edge Function for sending emails
3. Update notification channel configuration

### Enable SMS Notifications

1. Sign up for Twilio or similar SMS service
2. Add API credentials to Supabase secrets
3. Create Edge Function for SMS sending

### Add Social Authentication

1. In Supabase Dashboard, go to **Authentication** > **Providers**
2. Enable desired providers (Google, Facebook, Twitter, etc.)
3. Configure OAuth credentials
4. Update frontend to show social login buttons

### Enable AI Topic Similarity

1. Sign up for OpenAI or similar AI service
2. Add API key to environment variables
3. Create Edge Function for similarity detection
4. Update `APP_CONFIG.similarity.enableAI` to `true`

## Development Tips

### Hot Module Replacement (HMR)

Vite provides fast HMR. Changes to these files trigger instant updates:
- React components
- CSS/Tailwind classes
- Configuration files (requires restart)

### Database Changes

When modifying the database schema:

1. Create a new migration file in `supabase/migrations/`
2. Follow the naming convention: `YYYYMMDDHHMMSS_description.sql`
3. Include a detailed comment header
4. Always add RLS policies for new tables
5. Test locally before deploying

### Debugging

Enable detailed logging:
```typescript
// In src/lib/supabase.ts
export const supabase = createClient(url, key, {
  auth: {
    debug: true, // Enable auth debugging
  },
});
```

### Performance Monitoring

Add performance tracking:
```typescript
// In src/services/analyticsService.ts
performance.mark('page-load-start');
// ... load page
performance.mark('page-load-end');
performance.measure('page-load', 'page-load-start', 'page-load-end');
```

## Security Best Practices

1. **Never commit secrets**: Use `.env` for all sensitive data
2. **Review RLS policies**: Ensure data access is properly restricted
3. **Validate user input**: Always sanitize and validate on both client and server
4. **Use HTTPS**: Required for secure authentication and PWA
5. **Rate limiting**: Consider implementing rate limits for API calls
6. **Monitor logs**: Regularly check Supabase logs for suspicious activity
7. **Update dependencies**: Keep all packages up to date for security patches

## Getting Help

- **Documentation**: Check `/docs/` folder
- **GitHub Issues**: Report bugs or request features
- **Supabase Discord**: Community support for database issues
- **Stack Overflow**: Tag questions with `votehub` and `supabase`

## Next Steps

After setup is complete:

1. Read the [User Guide](./user/USER_GUIDE.md) to understand features
2. Review [API Documentation](./API.md) for integration
3. Check [Architecture Guide](./development/ARCHITECTURE.md) for code structure
4. Explore [Configuration Options](./CONFIGURATION.md) for customization

Happy voting! 🗳️
# VoteHub Quick Start Guide

Get VoteHub running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Supabase account (free at [supabase.com](https://supabase.com))

## Step 1: Get the Code

```bash
git clone <repository-url>
cd votehub
npm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click "New Project"
3. Fill in:
   - Name: VoteHub
   - Database Password: (create a strong password)
   - Region: (closest to you)
4. Wait for project to initialize (~2 minutes)

## Step 3: Get Credentials

1. In Supabase dashboard, click **Settings** (gear icon)
2. Click **API** in left sidebar
3. Copy these values:
   - **URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJxxxx...`

## Step 4: Configure Environment

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here
```

Replace `your_url_here` and `your_key_here` with values from Step 3.

## Step 5: Database Setup

The database migration is already set up in your Supabase project. Verify by:
1. Go to Supabase Dashboard
2. Click **Database** > **Migrations**
3. Confirm `create_voting_system_schema` is listed

## Step 6: Start Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Step 7: Create Account

1. Click "Sign Up" in top right
2. Enter:
   - Username
   - Email
   - Password (min 6 characters)
3. Click "Sign Up"

You're now signed in!

## Step 8: Create Your First Poll

1. Click "Create Topic"
2. Enter a question (e.g., "What's your favorite color?")
3. Select vote type: "Multiple Choice"
4. Enter options (one per line):
   ```
   Blue
   Red
   Green
   Yellow
   ```
5. Click "Create"

## Step 9: Vote and See Results

1. Click on your topic
2. Select an option
3. Click "Vote"
4. See real-time results on the right

## Common Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Quality
npm run typecheck    # Check TypeScript types
npm run lint         # Run ESLint
```

## Project Structure

```
votehub/
├── src/
│   ├── components/     # UI components
│   ├── pages/          # Page components
│   ├── services/       # Business logic
│   ├── contexts/       # React contexts
│   ├── config/         # Configuration
│   └── types/          # TypeScript types
├── public/             # Static assets
├── docs/               # Documentation
└── supabase/           # Database migrations
```

## Key Files

- **`.env`**: Environment variables
- **`src/config/app.config.ts`**: App configuration
- **`src/config/language.config.ts`**: Translations
- **`tailwind.config.js`**: Theme configuration

## Default Vote Types

1. **Yes/No**: Simple binary choice
2. **Multiple Choice**: Select from options
3. **Rating Scale**: Rate 1-5 (configurable)
4. **Open Ended**: Free text response

## Features

- ✅ User authentication
- ✅ Real-time voting
- ✅ Results visualization
- ✅ Theme switching (30+ themes)
- ✅ Responsive design (mobile to desktop)
- ✅ PWA support (installable)
- ✅ Analytics tracking
- ✅ Topic similarity detection

## Keyboard Shortcuts

- **`/`** - Focus search
- **`n`** - New topic (when signed in)
- **`Esc`** - Close modal

## Tips

### Change Theme
1. Click settings icon (gear) in header
2. Select theme from dropdown
3. Your preference is saved

### Search Topics
1. Go to Topics page
2. Type in search box
3. Results filter in real-time

### Update Vote
1. Go to topic you voted on
2. Select new choice
3. Click "Vote" again
4. Your vote updates automatically

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env` file exists
- Verify values are correct (no quotes needed)
- Restart dev server

### Can't Sign Up
- Check Supabase dashboard is accessible
- Verify database migration completed
- Check browser console for errors

### Votes Not Showing
- Refresh the page
- Check vote was submitted (green success message)
- Verify you're signed in

### Build Fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Next Steps

### For Users
- Read [User Guide](./user/USER_GUIDE.md)
- Explore available themes
- Create your first poll
- Share with friends

### For Developers
- Read [Architecture Guide](./development/ARCHITECTURE.md)
- Review [API Documentation](./API.md)
- Check [Configuration Guide](./CONFIGURATION.md)
- See [Recommendations](./RECOMMENDATIONS.md)

## Deploy to Production

### GitHub Pages (Configured)
```bash
npm run build
git add dist -f
git commit -m "Deploy to GitHub Pages"
git push origin main
```

Then configure in GitHub: Settings > Pages > Source: `/dist` folder

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full guide.

### Vercel (Alternative)
```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard.

### Netlify (Alternative)
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

### Self-Hosted
```bash
npm run build
# Serve dist/ folder with any static server
```

## Support

- **Documentation**: Check `/docs` folder
- **Issues**: GitHub Issues
- **Email**: support@votehub.com

## Quick Reference

### Database Tables
- `profiles` - User profiles
- `topics` - Poll topics
- `votes` - Individual votes
- `vote_type_configs` - Vote type definitions
- `vote_results_cache` - Aggregated results

### Services
- `topicService` - Topic operations
- `voteService` - Voting operations
- `analyticsService` - Event tracking

### Contexts
- `AuthContext` - Authentication state
- `ThemeContext` - Theme management

## Security Notes

- Never commit `.env` file
- Use strong database password
- Enable email verification for production
- Review RLS policies before launch
- Set up error tracking (Sentry)

## Performance Tips

- Results are cached for 1 minute
- Images should be optimized (WebP)
- Use lazy loading for long lists
- Enable compression in production
- Use CDN for static assets

---

**Need Help?**

Check the full documentation in `/docs` or create an issue on GitHub.

**Happy Voting! 🗳️**
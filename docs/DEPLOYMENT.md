# GitHub Pages Deployment Guide

## Overview

This guide covers deploying the VoteHub application to GitHub Pages at:
**https://arcticweb.github.io/pollm8/**

## Configuration Changes

### 1. Vite Configuration

The `vite.config.ts` has been configured with the correct base path:

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/pollm8/',  // Required for GitHub Pages subdirectory
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
```

### 2. .nojekyll File

A `.nojekyll` file has been added to `public/` directory to prevent GitHub Pages from using Jekyll processing, which can interfere with files starting with underscores.

## Deployment Steps

### Option 1: Manual Deployment (Recommended)

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Commit and push the dist folder**:
   ```bash
   git add dist -f
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. **Configure GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Set source to "Deploy from a branch"
   - Select branch: `main`
   - Select folder: `/dist`
   - Click Save

### Option 2: GitHub Actions (Automated)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

Then configure GitHub Pages to use GitHub Actions:
- Go to repository Settings > Pages
- Set source to "GitHub Actions"

## Environment Variables

For Supabase to work in production, you need to set up environment variables:

### Using GitHub Secrets

1. Go to repository Settings > Secrets and variables > Actions
2. Add the following secrets:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Using .env.production

Alternatively, create a `.env.production` file (do NOT commit this):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Build Verification

After building, verify the output:

```bash
# Check that paths are correct
cat dist/index.html
# Should show: /pollm8/assets/... for JS and CSS files

# Check file sizes
ls -lh dist/assets/
# JS should be ~390KB, CSS should be ~100KB
```

## Troubleshooting

### Issue: Blank page after deployment

**Cause**: Incorrect base path in Vite config

**Solution**: Ensure `base: '/pollm8/'` is set in `vite.config.ts`

### Issue: 404 errors for assets

**Cause**: Assets not found due to incorrect paths

**Solution**:
1. Verify the base path matches your repository name
2. Rebuild with `npm run build`
3. Clear browser cache

### Issue: MIME type errors

**Cause**: GitHub Pages trying to serve source files instead of built files

**Solution**:
1. Make sure you're deploying from the `/dist` folder
2. Verify `.nojekyll` file exists in `public/` (it will be copied to `dist/`)
3. Rebuild and redeploy

### Issue: Environment variables not working

**Cause**: .env file not included in build or incorrect variable names

**Solution**:
1. Ensure variables start with `VITE_` prefix
2. For GitHub Actions, add secrets to repository
3. For manual build, create `.env.production` file

### Issue: Service Worker errors

**Cause**: Service worker paths not updated for base URL

**Solution**: The service worker is optional for this app. If it causes issues:
1. Remove the service worker registration from `index.html`
2. Delete `public/service-worker.js`

## Post-Deployment Checklist

After deploying, verify:

- [ ] Site loads at https://arcticweb.github.io/pollm8/
- [ ] All assets (CSS, JS) load without 404 errors
- [ ] Forms are visible and functional
- [ ] Sign in/sign up modals work
- [ ] Supabase connection works
- [ ] Theme switching works
- [ ] No console errors
- [ ] Mobile responsive design works
- [ ] All pages accessible

## Performance Optimization

### Enable Compression

GitHub Pages automatically serves files with gzip compression. Your build output shows:

- **CSS**: 100.80 KB (uncompressed) → 16.96 KB (gzipped) - 83% reduction
- **JS**: 389.38 KB (uncompressed) → 106.64 KB (gzipped) - 73% reduction

### Cache Headers

GitHub Pages automatically sets cache headers for static assets. No additional configuration needed.

### CDN

GitHub Pages uses a CDN (Fastly) for global distribution automatically.

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the `public/` directory:
   ```
   yourdomain.com
   ```

2. Configure DNS:
   - For apex domain (example.com):
     ```
     A Record: 185.199.108.153
     A Record: 185.199.109.153
     A Record: 185.199.110.153
     A Record: 185.199.111.153
     ```
   - For subdomain (www.example.com):
     ```
     CNAME Record: arcticweb.github.io
     ```

3. Update `vite.config.ts`:
   ```typescript
   base: '/',  // Change from '/pollm8/' to '/'
   ```

4. Rebuild and redeploy

## Monitoring

### Check Deployment Status

- Go to repository > Actions tab
- View deployment history and logs
- Check for any errors

### Analytics

Consider adding analytics to track usage:

1. **Google Analytics**:
   ```html
   <!-- Add to index.html -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   ```

2. **Vercel Analytics** (alternative):
   ```bash
   npm install @vercel/analytics
   ```

## Security Considerations

### Environment Variables

- Never commit `.env` files
- Use GitHub Secrets for sensitive data
- Only expose public keys (VITE_SUPABASE_ANON_KEY is safe to expose)

### HTTPS

GitHub Pages enforces HTTPS automatically. No additional configuration needed.

### CORS

Ensure Supabase allows requests from your GitHub Pages URL:
- Go to Supabase Dashboard > Project Settings > API
- Add `https://arcticweb.github.io` to allowed origins

## Updating the Deployment

To deploy updates:

1. Make your changes
2. Test locally: `npm run dev`
3. Build: `npm run build`
4. Commit and push (or let GitHub Actions handle it)
5. Wait 1-2 minutes for deployment
6. Verify changes at https://arcticweb.github.io/pollm8/

## Rollback

To rollback to a previous version:

1. Find the commit hash of the working version
2. Checkout that commit: `git checkout <commit-hash>`
3. Build: `npm run build`
4. Force push: `git push origin main --force`

Or using GitHub Actions:
1. Go to Actions tab
2. Find successful deployment
3. Re-run workflow

## Support

If you encounter issues:

1. Check GitHub Pages status: https://www.githubstatus.com/
2. Review deployment logs in Actions tab
3. Verify Supabase connection in browser console
4. Check browser console for JavaScript errors

## Summary

Your VoteHub application is now configured for GitHub Pages deployment:

✅ Vite configured with base path `/pollm8/`
✅ .nojekyll file added
✅ Build outputs optimized and gzipped
✅ All form issues resolved (icons removed, fields visible)
✅ Ready for production deployment

To deploy: Run `npm run build` and push the dist folder to GitHub, then configure Pages settings.
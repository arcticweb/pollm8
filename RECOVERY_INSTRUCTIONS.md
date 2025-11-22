# Recovery Instructions - Manual GitHub Upload

**CRITICAL:** Bolt is not syncing these changes to GitHub. Follow these steps to manually recover your work.

---

## Most Important File: GitHub Actions Workflow

Create this file in your GitHub repo: `.github/workflows/deploy.yml`

You can do this via GitHub web interface:
1. Go to: https://github.com/arcticweb/pollm8
2. Click "Add file" → "Create new file"
3. Type filename: `.github/workflows/deploy.yml`
4. Paste the content below:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
      - dev
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

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
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

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

5. Click "Commit changes"
6. Select "Commit directly to the `dev` branch"
7. Click "Commit changes"

---

## Good News

**Your database is safe!** All migrations were successfully applied to Supabase:
- Schema is complete
- RLS policies are secure
- Indexes are in place
- Security issues are resolved

The only thing not synced to GitHub is the workflow file above.

---

## After Adding the Workflow

1. **Configure GitHub Pages:**
   - Go to: https://github.com/arcticweb/pollm8/settings/pages
   - Set Source to: **"GitHub Actions"**

2. **Add GitHub Secrets:**
   - Go to: https://github.com/arcticweb/pollm8/settings/secrets/actions
   - Add: `VITE_SUPABASE_URL`
   - Add: `VITE_SUPABASE_ANON_KEY`

3. **Trigger Deployment:**
   - Go to: https://github.com/arcticweb/pollm8/actions
   - Click "Deploy to GitHub Pages"
   - Click "Run workflow"

---

## Documentation

All documentation has been organized in `/docs/` but may not be synced yet.
The deployment guide is in: `docs/deployment/GITHUB_PAGES_SETUP.md`

If docs aren't synced, refer to this file for deployment instructions above.

---

## Report to Bolt Support

This is a critical sync issue that should be reported:
- Changes made but not synced to GitHub
- New browser window shows old code
- Affects ability to deploy and collaborate

# Deployment Checklist - Fix 404 Errors

Follow these steps **in order**. Each step takes 1-2 minutes.

## ☐ Step 1: Add GitHub Secrets

1. Go to: https://github.com/arcticweb/pollm8/settings/secrets/actions
2. Click **New repository secret**
3. Add first secret:
   - Name: `VITE_SUPABASE_URL`
   - Value: (from your .env file)
4. Click **New repository secret** again
5. Add second secret:
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: (from your .env file)

**You should see 2 secrets listed**

---

## ☐ Step 2: Push Code

Run in terminal:
```bash
git add .
git commit -m "Add GitHub Actions workflow"
git push origin main
```

---

## ☐ Step 3: Change GitHub Pages Source

**THIS IS THE MOST IMPORTANT STEP - This fixes the 404 errors!**

1. Go to: https://github.com/arcticweb/pollm8/settings/pages
2. Under "Source", select **GitHub Actions** (NOT "Deploy from a branch")
3. Done! (saves automatically)

---

## ☐ Step 4: Wait for Deployment

1. Go to: https://github.com/arcticweb/pollm8/actions
2. Wait for green checkmark (~2 minutes)
3. Visit: https://arcticweb.github.io/pollm8/

**You should see VoteHub, no more 404 errors!**

---

## ☐ Step 5: Configure Supabase CORS

1. Go to: https://supabase.com/dashboard
2. Click your project
3. Click **Settings** (gear icon) in left sidebar
4. Click **API**
5. Scroll to "CORS Configuration" or "Allowed Origins"
6. Add: `https://arcticweb.github.io`
7. Click **Save**

---

## ✅ Done!

Visit: https://arcticweb.github.io/pollm8/

Should work with no errors!

---

## Quick Troubleshooting

**Still getting 404 for /src/main.tsx?**
→ Step 3 not completed. Pages source must be "GitHub Actions"

**Build failing?**
→ Check secrets at https://github.com/arcticweb/pollm8/settings/secrets/actions

**Site loads but sign in doesn't work?**
→ Step 5 not completed. Add CORS in Supabase

**Can't find Supabase API settings?**
→ Dashboard > Select Project > Settings (gear icon) > API tab

---

## Where to Find Your .env Values

Open `.env` file in your project folder:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx...
```

Copy the values after the `=` sign.
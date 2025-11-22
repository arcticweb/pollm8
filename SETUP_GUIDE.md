# Complete Setup Guide - Fix 404 Errors

## Current Problem

You're seeing 404 errors because GitHub Pages is serving your raw source code instead of the built files. This happens when Pages is set to "Deploy from a branch" instead of "GitHub Actions".

## The 404 Errors You're Seeing

```
GET https://arcticweb.github.io/src/main.tsx 404  ← Raw source file (wrong!)
GET https://arcticweb.github.io/pollm8/vite.svg 404
GET https://arcticweb.github.io/pollm8/manifest.json 404
```

These should be loading from the built `dist/` folder, not raw source files.

## Solution: Complete GitHub Setup (5 Minutes)

### Part A: Add Supabase Secrets (2 minutes)

#### Step 1: Get Your Supabase Credentials

Open your `.env` file in the project. You should see:
```env
VITE_SUPABASE_URL=https://xxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx...
```

Copy both values.

#### Step 2: Go to GitHub Secrets Page

**Direct Link**: https://github.com/arcticweb/pollm8/settings/secrets/actions

Or navigate manually:
1. Go to: https://github.com/arcticweb/pollm8
2. Click the **Settings** tab (top right)
3. In the left sidebar, click **Secrets and variables** (expand if needed)
4. Click **Actions** (under "Secrets and variables")

#### Step 3: Add First Secret

1. Click the green **New repository secret** button
2. In the "Name" field, type: `VITE_SUPABASE_URL`
3. In the "Secret" field, paste your Supabase URL (e.g., `https://xxxxxx.supabase.co`)
4. Click **Add secret**

#### Step 4: Add Second Secret

1. Click **New repository secret** again
2. In the "Name" field, type: `VITE_SUPABASE_ANON_KEY`
3. In the "Secret" field, paste your Supabase anon key (starts with `eyJ`)
4. Click **Add secret**

You should now see 2 secrets listed.

---

### Part B: Push Code to GitHub (1 minute)

Open your terminal in the project folder and run:

```bash
git add .
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

This uploads the GitHub Actions workflow file.

---

### Part C: Configure GitHub Pages (1 minute)

This is the **critical step** that fixes the 404 errors!

#### Step 1: Go to Pages Settings

**Direct Link**: https://github.com/arcticweb/pollm8/settings/pages

Or navigate manually:
1. Go to: https://github.com/arcticweb/pollm8
2. Click **Settings** tab
3. In the left sidebar, scroll down and click **Pages**

#### Step 2: Change Source to GitHub Actions

You'll see a section called "Build and deployment".

**Current setting** (causes 404s):
```
Source: Deploy from a branch
Branch: main
Folder: / (root) or /dist
```

**Change it to**:
1. Click the **Source** dropdown
2. Select **GitHub Actions**
3. That's it! The page will update automatically

It should now say:
```
Source: GitHub Actions
```

No need to click Save - it's automatic.

---

### Part D: Wait for Deployment (2 minutes)

#### Step 1: Monitor GitHub Actions

**Direct Link**: https://github.com/arcticweb/pollm8/actions

You should see:
- A workflow run called "Deploy to GitHub Pages"
- Status: Running (yellow dot) or Completed (green checkmark)

#### Step 2: Wait for Green Checkmark

The workflow takes about 2-3 minutes:
- Installing dependencies (~1 min)
- Building project (~30 sec)
- Deploying to Pages (~1 min)

When you see a **green checkmark**, deployment is complete!

#### Step 3: Visit Your Site

Go to: **https://arcticweb.github.io/pollm8/**

You should now see:
- ✅ VoteHub landing page loads
- ✅ No 404 errors in console
- ✅ No MIME type errors
- ✅ All assets load correctly

---

## Part E: Configure Supabase CORS (1 minute)

Now that your site is deployed, tell Supabase to allow requests from GitHub Pages.

### How to Access Supabase Settings

#### Step 1: Go to Supabase Dashboard

**Direct Link**: https://supabase.com/dashboard

Or:
1. Go to: https://supabase.com
2. Click **Sign in** (top right)
3. Sign in with your account

#### Step 2: Select Your Project

You'll see a list of your projects. Click on the project you're using for VoteHub.

#### Step 3: Go to API Settings

You'll see a left sidebar with options:

1. Click the **Settings** icon (gear icon at bottom of sidebar)
2. Click **API** in the submenu

Or use direct link format:
```
https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api
```

#### Step 4: Scroll to CORS Configuration

Scroll down the page until you see a section called:
- **CORS Configuration** or
- **Allowed Origins** or
- **Website URL**

#### Step 5: Add GitHub Pages URL

In the text field, add:
```
https://arcticweb.github.io
```

Note: Do NOT include `/pollm8/` at the end, just the domain.

If there are existing URLs, you may need to:
- Click **Add** button, or
- Enter URLs as comma-separated list, or
- Enter one per line (depends on Supabase UI)

#### Step 6: Save

Click the **Save** button at the bottom of the section.

---

## Verification Checklist

After completing all steps, verify:

### GitHub Configuration ✓
- [ ] Secrets added (2 secrets visible at https://github.com/arcticweb/pollm8/settings/secrets/actions)
- [ ] Code pushed (workflow file visible at https://github.com/arcticweb/pollm8/tree/main/.github/workflows)
- [ ] Pages source is "GitHub Actions" (check https://github.com/arcticweb/pollm8/settings/pages)
- [ ] Workflow succeeded (green checkmark at https://github.com/arcticweb/pollm8/actions)

### Site Working ✓
- [ ] Site loads: https://arcticweb.github.io/pollm8/
- [ ] Open browser console (F12), no 404 errors
- [ ] No MIME type errors
- [ ] Forms are visible
- [ ] Can open Sign In modal

### Supabase CORS ✓
- [ ] Added `https://arcticweb.github.io` to allowed origins
- [ ] Saved changes
- [ ] Can test sign in/sign up

---

## Troubleshooting

### Still Seeing 404 for /src/main.tsx?

**Problem**: GitHub Pages source is still set to "Deploy from a branch"

**Solution**:
1. Go to https://github.com/arcticweb/pollm8/settings/pages
2. Change Source to **GitHub Actions**
3. Wait 2 minutes
4. Hard refresh browser (Ctrl+Shift+R)

### Workflow Not Running?

**Problem**: Workflow file not pushed to GitHub

**Solution**:
```bash
git add .github/workflows/deploy.yml
git commit -m "Add workflow"
git push origin main
```

### Build Failing?

**Problem**: Missing secrets or incorrect names

**Solution**:
1. Check secrets at https://github.com/arcticweb/pollm8/settings/secrets/actions
2. Verify names are EXACTLY:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Delete and re-add if names are wrong

### Can't Find Supabase API Settings?

**Alternative path**:
1. Supabase Dashboard
2. Select project
3. Click **Project Settings** (gear icon in left sidebar)
4. Click **API** tab
5. Scroll down to find CORS or Origins section

### Site Loads But Sign In Doesn't Work?

**Problem**: CORS not configured

**Solution**:
1. Check browser console for CORS errors
2. Go back to Supabase API settings
3. Ensure `https://arcticweb.github.io` is added
4. Save and wait 1 minute
5. Hard refresh browser

---

## What Each Step Does

### Secrets
- Provide Supabase credentials to GitHub Actions
- Injected as environment variables during build
- Never exposed in code or logs

### GitHub Actions
- Automatically builds your project on push
- Creates production-ready `dist/` folder
- Deploys to GitHub Pages with correct MIME types
- Runs in GitHub's secure infrastructure

### Pages Source
- **"Deploy from a branch"** = Serves raw source code → 404 errors
- **"GitHub Actions"** = Serves built files → Works correctly

### Supabase CORS
- Allows your GitHub Pages site to connect to Supabase
- Without it, browser blocks requests (security)
- Must match your site's exact domain

---

## Summary: The Fix

**The Problem**:
- GitHub Pages serving raw source files instead of built files
- Causes 404s for `/src/main.tsx` and other assets

**The Solution**:
- Use GitHub Actions to build and deploy
- Change Pages source from "branch" to "GitHub Actions"
- Add Supabase secrets for build-time injection

**Result**:
- ✅ No more 404 errors
- ✅ Proper MIME types
- ✅ Automatic deployments on every push
- ✅ Site works at https://arcticweb.github.io/pollm8/

---

## Quick Links Reference

- **GitHub Secrets**: https://github.com/arcticweb/pollm8/settings/secrets/actions
- **GitHub Pages Settings**: https://github.com/arcticweb/pollm8/settings/pages
- **GitHub Actions**: https://github.com/arcticweb/pollm8/actions
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Your Deployed Site**: https://arcticweb.github.io/pollm8/

---

## Need Help?

If you're still stuck after following this guide:

1. Check which step failed
2. Look at the specific error message
3. Review the troubleshooting section for that step
4. Check GitHub Actions logs if build failed
5. Check browser console if site doesn't work

Most issues are:
- Forgot to change Pages source to "GitHub Actions" (90% of cases)
- Secrets have wrong names or values
- CORS not configured in Supabase
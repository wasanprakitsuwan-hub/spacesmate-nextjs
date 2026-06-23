# SpacesMate — Deployment Guide
## From Code to Live at spacesmate.com

---

## STEP 1 — Install Node.js (one time)

1. Go to https://nodejs.org → download **LTS version**
2. Install it — default settings are fine
3. Open Terminal and run: `node -v` → should show v20+

---

## STEP 2 — Install the project

Open Terminal, run these commands one by one:

```bash
# Go to the project folder
cd "/Users/wasan/Desktop/SpacesMate AI/04 Tech/spacesmate-nextjs"

# Install all dependencies
npm install

# Test it runs locally
npm run dev
```

Open your browser → http://localhost:3000 → you should see SpacesMate homepage.

---

## STEP 3 — Set up Supabase (database)

1. Go to https://supabase.com → Sign up free
2. Click **New Project**
   - Name: `spacesmate`
   - Password: (save this somewhere safe)
   - Region: **Southeast Asia (Singapore)**
3. Wait ~2 minutes for setup
4. Go to **SQL Editor** → paste the entire contents of `supabase/schema.sql` → click **Run**
5. Go to **Storage** → create bucket:
   - Name: `property-images`
   - Public: YES
6. Go to **Settings → API** → copy:
   - `Project URL` → your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → your `SUPABASE_SERVICE_ROLE_KEY` *(keep secret)*

---

## STEP 4 — Set up environment variables

In the project folder, create a file called `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_SITE_URL=https://spacesmate.com
```

Test locally again: `npm run dev` — listings will now connect to real database.

---

## STEP 5 — Push to GitHub

1. Go to https://github.com → create account if needed
2. Click **New repository**
   - Name: `spacesmate-nextjs`
   - Private: YES
3. In Terminal:

```bash
cd "/Users/wasan/Desktop/SpacesMate AI/04 Tech/spacesmate-nextjs"
git init
git add .
git commit -m "Initial SpacesMate Next.js build"
git remote add origin https://github.com/YOUR_USERNAME/spacesmate-nextjs.git
git push -u origin main
```

---

## STEP 6 — Deploy to Vercel

1. Go to https://vercel.com → sign up with GitHub
2. Click **Add New → Project**
3. Import your `spacesmate-nextjs` repository
4. **Environment Variables** — add all 4 from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
5. Click **Deploy** → Vercel builds and deploys automatically
6. You get a URL like: `spacesmate-nextjs.vercel.app` — test it

---

## STEP 7 — Connect spacesmate.com domain

1. In Vercel → your project → **Settings → Domains**
2. Add `spacesmate.com` and `www.spacesmate.com`
3. Vercel shows you DNS records to add
4. Log into your domain registrar (wherever you bought spacesmate.com)
5. Add the DNS records Vercel gave you
6. Wait 10–30 minutes → spacesmate.com is live on the new Next.js site

---

## AFTER GOING LIVE

### Add your first real listing
1. Go to Supabase → Table Editor → `properties`
2. Insert a row with your property data
3. Set `listing_status = 'active'` and `verified = true`
4. Add images in `property_images` table with the Supabase Storage URL

### Future: landlord self-signup
The Submit Listing Wizard at `/submit` is ready — it just needs Supabase Auth connected (next phase).

---

## Cost Summary

| Service | Cost |
|---------|------|
| Vercel (Hobby) | Free (up to 100GB bandwidth) |
| Supabase (Free tier) | Free (500MB DB, 1GB storage) |
| Domain (spacesmate.com) | Already owned |
| **Total monthly** | **฿0** |

Upgrade to paid tiers only when traffic grows past free limits.

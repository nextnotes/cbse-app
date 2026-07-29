# CBSE Learn — Setup & Deploy Guide (zero experience needed)

Follow these steps in order. Each one takes a few minutes. Don't skip ahead.

---

## STEP 1 — Create a free Supabase project (your database + login system)

1. Go to https://supabase.com → **Start your project** → sign up (free).
2. Click **New project**. Pick any name (e.g. "cbse-learn"), set a database password (save it somewhere), choose the region closest to India, click **Create**. Wait ~2 minutes.
3. In the left sidebar, click the **SQL Editor** icon → **New query**.
4. Open the file `supabase/schema.sql` from this project (in a text editor), copy ALL of it, paste it into the SQL editor, and click **Run**. This creates your tables and adds one sample Std 8 SST chapter.
5. In the left sidebar, click **Project Settings** (gear icon) → **API**. You'll see:
   - **Project URL** → copy this
   - **anon public** key → copy this
   - **service_role** key (click "reveal") → copy this — keep this one SECRET, never share it publicly.

Keep this tab open — you'll paste these into Vercel in Step 4.

---

## STEP 2 — Get a free Anthropic API key (powers the AI content generator)

1. Go to https://console.anthropic.com → sign up.
2. Go to **Settings → API Keys → Create Key**. Copy it.
3. Add a small amount of credit (a few dollars) under **Billing** — generating notes costs fractions of a cent each, so this will last a long time.

---

## STEP 3 — Put the code on GitHub

1. Go to https://github.com → sign up (free).
2. Click the **+** icon (top right) → **New repository**. Name it `cbse-app`, keep it **Public** or **Private** (either works), click **Create repository**.
3. On the new repo page, click **uploading an existing file**.
4. Drag in ALL the files and folders from this project (the whole `cbse-app` folder contents — `app`, `components`, `lib`, `styles`, `supabase`, `package.json`, `next.config.js`, `.gitignore`, `.env.local.example`, `README.md`). GitHub supports drag-and-drop of folders in most browsers.
   - **Do NOT upload a `.env.local` file** if you ever create one locally — it contains secrets. It's already excluded via `.gitignore`.
5. Scroll down, click **Commit changes**.

---

## STEP 4 — Deploy to Vercel (free hosting)

1. Go to https://vercel.com → **Sign up** → choose **Continue with GitHub** (this links the two automatically).
2. Click **Add New... → Project**.
3. Find your `cbse-app` repo in the list → click **Import**.
4. Before clicking Deploy, open **Environment Variables** and add these four, one at a time (name → value):
   - `NEXT_PUBLIC_SUPABASE_URL` → (from Step 1)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → (from Step 1)
   - `SUPABASE_SERVICE_ROLE_KEY` → (from Step 1)
   - `ANTHROPIC_API_KEY` → (from Step 2)
5. Click **Deploy**. Wait 1-2 minutes.
6. You'll get a live URL like `https://cbse-app-yourname.vercel.app` — this is your real, working website.

---

## STEP 5 — Make yourself an admin

1. Visit your live site → click **Sign up** → create an account normally (name, grade, a Unique ID, a password).
2. Go back to Supabase → **Table Editor** → `profiles` table.
3. Find the row with your Unique ID → click into the `role` cell → change `student` to `admin` → press Enter to save.
4. Now go to your site's `/admin/login` page and log in with the same Unique ID and password. You're in the admin dashboard.

---

## How to add content going forward

- **Admin dashboard** (`/admin/login`): pick Grade + Subject + Chapter name, then either:
  - Type a topic and click **Generate from topic** (AI writes notes, practice questions, and a mind map), or
  - Paste existing textbook text and click **Generate from pasted text** to summarize it, or
  - Just type/paste notes and questions manually — no AI required.
- Review/edit anything generated, then click **Save chapter**. It appears instantly for students in that grade/subject.
- For 3D models: upload a `.glb` 3D file anywhere you can get a direct link (e.g. a public Google Drive/GitHub link ending in `.glb`), paste that link into the "3D model URL" field.

## Notes on what's built vs. what's a starting point

- Fully working: signup/login/logout, forgot ID & password recovery, admin vs student roles, subject/chapter browsing, notes, interactive practice sets with instant feedback, mind maps, and a 3D model viewer.
- Only **Std 8 SST** has a sample chapter pre-loaded — everything else is an empty shelf waiting for content, which the AI tool can fill in quickly per chapter.
- The mind map is a simple, clean nested-box style (no extra library needed) — it can be upgraded to a fancier animated version later if you want.

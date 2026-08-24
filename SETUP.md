# SHYAM PHARMA — Setup & Deployment

The site is now a fully static front end backed by Supabase.
There is no PHP and no server to run.

| Layer | Where it lives |
|---|---|
| Pages, styles, scripts | This repo, served as static files |
| Database | Supabase Postgres (`products`, `site_settings`) |
| Product images | Supabase Storage (`product-images` bucket) |
| Admin login | Supabase Auth |

---

## Step 1 — Run the database migration

Supabase dashboard → **SQL Editor** → **New query**.
Paste the entire contents of `supabase/migrations/20260824000000_init.sql`
and click **Run**.

This creates both tables, the storage bucket, the Row Level Security
policies, and seeds the three original products.

Verify: **Table Editor** should now list `products` with 3 rows, each
marked with a green **RLS enabled** badge.

## Step 2 — Add your public API key

Supabase dashboard → **Project Settings** → **API Keys**.
Copy the **anon / public** key (or the newer **publishable** key).

Open `supabase-config.js` and replace the placeholder:

```js
const SUPABASE_ANON_KEY =
    "PASTE_YOUR_SUPABASE_ANON_KEY_HERE";
```

This key is meant to be public — it ships to every visitor's browser
and is safe to commit. It only grants what the RLS policies allow.

**Never put the `service_role` key in this file.** That key bypasses
RLS completely and would let anyone wipe the database.

## Step 3 — Create the admin user

Supabase dashboard → **Authentication** → **Users** → **Add user** →
**Create new user**.

- Enter the admin's email address and a strong password
- Tick **Auto Confirm User** (otherwise login is blocked pending email
  confirmation)

The old `admin` / `admin123` credentials are gone. Login is now by
email address, verified by Supabase.

## Step 4 — Test locally

The pages must be served over HTTP, not opened as `file://`:

```bash
python3 -m http.server 5500
```

Then visit `http://localhost:5500`.

- `index.html` — products should load from the database
- `admin.html` — sign in with the user from step 3
- `dashboard.html` — add, edit and delete products; opening it without
  signing in should bounce you back to the login page

## Step 5 — Deploy to Vercel

1. [vercel.com/new](https://vercel.com/new) → import `Kd230907/ShyamPharma`
2. Framework preset: **Other**
3. Leave build command and output directory **empty** — this is a static site
4. **Deploy**

`vercel.json` is already configured. Every push to `main` redeploys.

## Step 6 — Lock down Supabase Auth

Supabase dashboard → **Authentication** → **URL Configuration**:

- **Site URL** → your Vercel URL (e.g. `https://shyam-pharma.vercel.app`)
- **Redirect URLs** → add the same URL

Without this, password-reset and OAuth links point at `localhost`.

---

## Notes

- **Settings now sync across devices.** Company details and theme live in
  the `site_settings` table rather than one browser's localStorage.
- **Images are no longer base64.** Uploads go to Supabase Storage and the
  row stores only the public URL — previously the whole encoded image was
  written into the record.
- **The only localStorage left** is the "remember me" email on the login
  page. It is a convenience, not a credential.
- **Free tier caveat:** Supabase pauses a project after 7 days with no
  activity. Open the dashboard to resume it.

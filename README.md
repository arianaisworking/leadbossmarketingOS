# The Lead Boss Marketing OS v3

A local-first Marketing OS with backend-ready Supabase + OpenAI integration.

## What this version includes

- Bright white / blush / champagne design
- Monthly content calendar with editable statuses
- Research + Content Factory
- Screenshot/photo uploads in:
  - Research + Content Factory
  - Story Bank
  - Comment Marketing Center
- Generated assets bucket
- Brand Brain
- Social Directory
- Export/import backup
- Supabase Edge Function for OpenAI content generation
- Supabase schema for future persistent backend storage

## Do we need Resend?

Not for the core system. Resend is only useful later if you want:

- Weekly content plan emails to Ariana/Aima
- Approval reminders
- Daily task summaries
- Internal notification emails
- Drafted outreach emails to agency prospects

For this build, skip Resend. Keep the workflow focused on content generation, calendar planning, and manual posting.

## Setup Steps

### 1. GitHub
Upload this folder to a GitHub repo.

### 2. Cloudflare Pages
Deploy the repo as a static site. Use `index.html` as the main file.

### 3. Supabase Database
Open Supabase SQL Editor and run:

`supabase/sql/schema.sql`

### 4. Supabase Edge Function
Install Supabase CLI, then run:

```bash
supabase functions deploy generate-content
supabase secrets set OPENAI_API_KEY=sk-your-key-here
```

### 5. Dashboard Backend Settings
Open the dashboard → Brand Brain → Backend Settings.

Enter:

- Supabase URL
- Supabase anon key
- Function name: `generate-content`

The OpenAI key is never placed in the browser.

## Notes

This version does not auto-post, scrape the internet, or send emails. It processes what Aima pastes/uploads and helps her create original Lead Boss content fast.

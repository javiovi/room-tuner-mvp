# Supabase Setup Guide

## Setup Steps

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Sign in with GitHub
3. Click "New Project"
4. Configure:
   - **Name**: room-tuner-mvp
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: South America (São Paulo)
   - **Plan**: Free tier
5. Click "Create new project" (takes ~2 minutes)

### 2. Get API Credentials

Once your project is created:

1. Go to **Settings** > **API** in Supabase dashboard
2. Copy these values to `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire content of `schema.sql` (this file)
4. Paste and click "Run"
5. Verify tables were created:
   - Check the output at the bottom
   - Should show 4 tables: projects, analyses, products, measurements

### 4. Verify Setup

Run this query in SQL Editor to check everything:

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

You should see:
- projects
- analyses
- products
- measurements

### 5. Test Connection (Optional)

In your Next.js app, you can test the connection:

```typescript
import { supabase } from '@/lib/supabase/client'

// Test query
const { data, error } = await supabase.from('products').select('*')
console.log({ data, error })
```

## Files

- `client.ts` - Supabase client (browser + server)
- `schema.sql` - Database schema (run this in Supabase SQL Editor)
- `database.types.ts` - TypeScript types for database

## Security Notes

⚠️ **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` to the client!

- `NEXT_PUBLIC_*` variables are safe for browser (read-only via RLS)
- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS - only use in API routes

## Row Level Security (RLS)

The schema includes RLS policies to ensure:
- Users can only access their own projects
- Users can only see analyses of their own projects
- Everyone can read products (public catalog)

## Next Steps

After setup:
1. Update API routes to use Supabase
2. Add authentication (Supabase Auth)
3. Persist Zustand state to Supabase

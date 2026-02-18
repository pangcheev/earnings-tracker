# Supabase Cloud Sync Setup Guide

This guide will help you set up cloud synchronization for the earnings tracker using Supabase.

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with email
4. Create a new organization and project
5. Wait for the project to be initialized (2-3 minutes)

## Step 2: Get Your Credentials

Once your project is created:

1. Go to **Project Settings** (gear icon)
2. Click **API** in the left sidebar
3. Copy these values:
   - **Project URL** (under "Project URL")
   - **anon public** (under "Project API keys")
   - **Service role secret** (if needed for backend)

## Step 3: Configure Local Environment

1. Open `.env.local` in the project root:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. Replace with your actual credentials from Step 2

3. Save the file

## Step 4: Create Database Table

1. In Supabase, go to **SQL Editor** (in the left sidebar)
2. Click **New Query**
3. Open the file: `supabase/migrations/001_create_sessions.sql`
4. Copy the entire SQL content
5. Paste it into Supabase SQL Editor
6. Click **Run** (or press `Ctrl+Enter`)
7. You should see "Query successful" message

The table `sessions` is now created with proper indexes and security policies.

## Step 5: Test the Connection

1. Restart your dev server (or it will auto-restart)
   ```
   npm run dev
   ```

2. Open the app in your browser: https://192.168.0.158:5174/

3. Open browser console (F12 → Console tab)

4. You should see: `☁️  Loaded 0 sessions from Supabase`
   - This means the connection is working!

5. Create a new session in the app

6. Check console: `☁️  Saved session to Supabase`

7. Refresh the page - session should still be there!

## Step 6: Verify Cloud Sync

Still in Supabase:

1. Go to **Table Editor**
2. Click on `sessions` table
3. You should see your created sessions listed

✅ **Cloud sync is now working!**

## Troubleshooting

### Error: "Supabase credentials not configured"
- Check that `.env.local` exists in the project root
- Verify the environment variables are correct
- Restart dev server after changing `.env.local`

### Error: "Failed to load from cloud"
- Make sure the `sessions` table was created (Step 4)
- Check browser console for detailed error message
- Verify the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct

### Table query fails in Supabase SQL Editor
- Make sure you're running the exact SQL from `supabase/migrations/001_create_sessions.sql`
- Check for syntax errors (typos in column names, etc.)
- Try running just the CREATE TABLE part first, then the other commands

### Data not syncing
- Check that Row Level Security (RLS) is enabled
- Verify the RLS policy allows all operations
- Check browser console for errors

## Security Note

The current setup uses a permissive RLS policy for development. In production, you should:

1. Enable proper authentication (Supabase Auth)
2. Update RLS policies to only allow users to access their own data
3. Use the Service Role secret on the backend only
4. Never expose Service Role secret to the frontend

For now, this is safe for local use on your home network.

## Next Steps

Once cloud sync is working, you can:

1. **Access from anywhere**: Deploy the React app to Vercel/Netlify
2. **Multi-device sync**: All devices will sync to the same Supabase database
3. **Backup data**: Supabase automatically backs up your data
4. **Scale up**: Free tier supports unlimited sessions/storage

---

Need help? Check the Supabase docs: https://supabase.com/docs

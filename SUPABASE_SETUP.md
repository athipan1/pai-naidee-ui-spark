# Supabase Backend Setup Guide

This guide will help you configure the PaiNaiDee UI application to connect to your Supabase backend.

## Prerequisites

- A Supabase account (free tier available at [supabase.com](https://supabase.com))
- A Supabase project with the required database tables

## Required Environment Variables

The application requires the following environment variables to connect to Supabase:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous/public API key

## Setup Instructions

### 1. Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Navigate to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **Project API keys** → **anon public** key

### 2. Configure Environment Variables

Create or update your `.env.local` file in the project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

**Note:** Replace the placeholder values with your actual Supabase credentials.

### 3. Required Database Tables

Your Supabase database should include the following tables for full functionality:

- `users` - User profiles and authentication data
- `bookings` - Booking/reservation information
- `attractions` - Tourist attractions and places data
- `places` - Location and venue information

### 4. Row Level Security (RLS)

Ensure your Supabase tables have appropriate Row Level Security policies configured:

1. In your Supabase dashboard, go to **Authentication** → **Policies**
2. Enable RLS on your tables
3. Create policies that allow anonymous read access for public data

Example policy for the `places` table:
```sql
-- Allow anonymous users to read places data
CREATE POLICY "Allow anonymous read access to places" ON places
FOR SELECT TO anon USING (true);
```

## Testing the Connection

### Using the Diagnostic Page

1. Start your development server: `npm run dev`
2. Navigate to `/diagnostic/supabase` in your browser
3. View the connection status and any issues

### Using the Command Line

Run the connectivity check script:

```bash
npm run check:supabase
```

This will display a detailed report about your Supabase configuration and connectivity.

## Common Issues and Solutions

### Issue: "URL Configured: ❌" or "API Key Configured: ❌"

**Solution:** 
- Ensure your `.env.local` file exists in the project root
- Verify the environment variable names are exactly `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your development server after making changes

### Issue: "Connection failed: fetch failed"

**Solutions:**
- Verify your Supabase project is active and not paused
- Check your internet connection
- Ensure the Supabase URL is correct and accessible
- Verify your API key is valid and not expired

### Issue: "Table access failed"

**Solutions:**
- Ensure your database tables exist in Supabase
- Check Row Level Security policies allow anonymous access
- Verify your anon key has the necessary permissions

### Issue: Environment variables not loading

**Solutions:**
- Ensure your `.env.local` file is in the project root (same level as `package.json`)
- Restart your development server after changes
- For production deployments, set environment variables in your hosting platform (Vercel, Netlify, etc.)

## Development vs Production

### Development
- Use `.env.local` for local development
- Include `.env.local` in your `.gitignore` (already done)

### Production
- Set environment variables in your deployment platform
- Update `.env.production` with production values (without sensitive data)
- For Vercel: Project Settings → Environment Variables
- For Netlify: Site Settings → Environment Variables

## Troubleshooting

If you encounter issues:

1. Run the diagnostic check: `npm run check:supabase`
2. Check the browser's network tab for failed requests
3. Verify your Supabase project status in the dashboard
4. Ensure your database schema matches the expected tables

## Support

For additional help:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the connectivity test results in the diagnostic page
- Examine the detailed report for specific error messages
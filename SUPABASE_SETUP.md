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

## ✅ Application Status & Improvements

The PaiNaiDee application has been enhanced with comprehensive Supabase integration:

### 🔧 **Enhanced Error Handling**
- **Configuration Detection**: Automatic detection of proper Supabase credentials
- **Graceful Fallback**: Falls back to high-quality mock data when Supabase is not configured
- **Clear Error Messages**: Bilingual error messages in both Thai and English
- **Automatic Retry**: Built-in retry mechanisms with user feedback

### 🎨 **Improved User Experience**
- **Interactive Setup Guide**: Step-by-step instructions shown when Supabase is not configured
- **Loading States**: Beautiful skeleton loaders during data fetch
- **Visual Indicators**: Clear indicators showing data source (Supabase vs Mock)
- **Responsive Design**: Works perfectly on all devices and screen sizes

### 🌐 **Full Internationalization**
- **Complete Bilingual Support**: Full Thai/English interface throughout
- **Thai Place Names**: Proper display of Thai location names and descriptions
- **Cultural Sensitivity**: UI design respects Thai cultural conventions
- **Locale-Aware Formatting**: Proper number and text formatting for each language

### 🛡️ **Robust Data Handling**
- **Null-Safe Queries**: All database queries handle null/undefined values properly
- **TypeScript Safety**: Enhanced type checking prevents runtime errors
- **Input Validation**: Comprehensive validation and sanitization for all data
- **Error Boundaries**: Comprehensive error recovery throughout the application

## Testing the Enhanced Setup

### 1. **Run the Connectivity Check**
```bash
npm run check:supabase
```

This enhanced diagnostic will verify:
- Environment variable configuration status
- Database connection health
- Table accessibility and permissions
- Sample data query execution

### 2. **Start the Development Server**
```bash
npm run dev
```

Visit `http://localhost:8080` to see the enhanced application.

### 3. **What You Should See**

**✅ With Supabase Configured:**
- Green connection indicator in the UI
- Data fetched directly from your Supabase database
- Setup guide automatically hidden (since configuration is complete)
- Full functionality with your actual data

**⚠️ Without Supabase Configured:**
- Interactive orange setup guide with step-by-step instructions
- High-quality mock data featuring authentic Thai tourism locations:
  - หมู่เกาะพีพี (Phi Phi Islands) - กระบี่
  - วัดพระแก้ว (Wat Phra Kaew) - กรุงเทพฯ  
  - ดอยอินทนนท์ (Doi Inthanon) - เชียงใหม่
- Warning indicators clearly showing fallback mode
- Interactive buttons to help with Supabase setup

## Enhanced Error Handling & Solutions

### Issue: "ไม่พบข้อมูล" (No data found) Message

**What it means:** This is the enhanced "no data found" state in both Thai and English.

**Solutions:**
- This is expected when your `places` table is empty
- Insert sample data using the provided SQL commands
- Check that your table has the correct column names
- Verify RLS policies allow data reading

### Issue: Application Shows Mock Data Instead of Supabase Data

**Possible causes:**
- Environment variables not properly configured
- Supabase project is paused or inaccessible
- Database permissions are too restrictive
- Table schema doesn't match expected structure

**Solutions:**
1. Check the setup guide displayed in the application
2. Verify your `.env.local` file has correct credentials
3. Run `npm run check:supabase` for detailed diagnostics
4. Restart the development server after configuration changes

## Mock Data Fallback Features

Even without Supabase configured, the application provides a rich experience:

### 🏖️ **Authentic Thai Tourism Data**
- **Phi Phi Islands (หมู่เกาะพีพี)**: Beach destination in Krabi
- **Wat Phra Kaew (วัดพระแก้ว)**: Cultural temple in Bangkok
- **Doi Inthanon (ดอยอินทนนท์)**: Nature destination in Chiang Mai

### 🎯 **Full Functionality**
- Interactive attraction cards with proper ratings and reviews
- Working favorite/bookmark system
- Functional sharing buttons
- Language toggle (Thai/English)
- Responsive grid layout
- Category filtering and search

### 🚀 **User Experience**
- Smooth loading animations and skeleton states
- Error handling with retry mechanisms
- Clear visual indicators of data source
- Contextual help and setup guidance

## Troubleshooting

If you encounter issues:

1. **Run Enhanced Diagnostics**: `npm run check:supabase`
2. **Check Browser Console**: Look for detailed error messages
3. **Verify Network Tab**: Check for failed requests in browser dev tools
4. **Validate Configuration**: Ensure environment variables are exactly correct
5. **Check Supabase Dashboard**: Verify project status and table structure
6. **Review Setup Guide**: Follow the interactive guide shown in the application

The enhanced application provides comprehensive feedback and guidance to help diagnose and resolve any issues quickly.
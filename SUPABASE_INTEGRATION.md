# Supabase Integration for PaiNaiDee

This document describes the Supabase integration implementation for the PaiNaiDee travel application.

## Overview

The Supabase integration provides backend database connectivity for the PaiNaiDee app, enabling real-time data access and user authentication. While originally designed for React Native (Expo), this implementation has been adapted for web compatibility.

## Features Implemented

### ✅ Core Requirements Met

1. **AsyncStorage Integration**: Uses `@react-native-async-storage/async-storage` for session persistence
2. **Supabase Client Configuration**: Proper `createClient` setup with all required options
3. **Environment Variables**: Support for `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_KEY`
4. **Auth Options**: Complete configuration with:
   - `storage: AsyncStorage`
   - `autoRefreshToken: true`
   - `persistSession: true`
   - `detectSessionInUrl: false`
   - `lock: processLock`
5. **Process Lock**: Custom implementation to prevent auth race conditions
6. **getPlaces() Function**: Main data fetching function from 'places' table

### 🚀 Additional Features

1. **Enhanced Data Functions**:
   - `getPlacesByCategory(category)` - Filter places by category
   - `getPlaceById(id)` - Get specific place details
   - `searchPlaces(searchTerm)` - Search places by name/description

2. **Demo Page**: Interactive demonstration at `/src/app/pages/SupabaseDemoPage.tsx`
3. **API Integration Tests**: Updated tests include Supabase connectivity checks
4. **Error Handling**: Comprehensive error management with user-friendly messages
5. **TypeScript Support**: Full type safety throughout the integration

## File Structure

```
src/
├── services/
│   └── supabase.service.ts     # Main Supabase service
├── lib/
│   └── processLock.ts          # Process lock utility
├── app/pages/
│   └── SupabaseDemoPage.tsx    # Demo and testing page
├── components/common/
│   └── APIIntegrationTest.tsx  # Updated with Supabase tests
└── test/
    └── supabase.service.test.ts # Unit tests
```

## Environment Setup

### Required Environment Variables

Add these to your `.env` file:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key_here
```

### Dependencies Added

```json
{
  "@supabase/supabase-js": "latest",
  "@react-native-async-storage/async-storage": "latest"
}
```

Note: `react-native-url-polyfill` was omitted for web compatibility.

## Usage Examples

### Basic Usage

```typescript
import { supabase, getPlaces } from '@/services/supabase.service';

// Get all places
const places = await getPlaces();

// Get places by category
const temples = await getPlacesByCategory('temple');

// Search places
const searchResults = await searchPlaces('bangkok');
```

### Direct Supabase Client

```typescript
import { supabase } from '@/services/supabase.service';

// Direct database queries
const { data, error } = await supabase
  .from('places')
  .select('*')
  .eq('category', 'beach');
```

## Database Schema Expected

The service expects a `places` table with at least these fields:

```sql
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Testing

### Unit Tests
```bash
npm run test src/test/supabase.service.test.ts
```

### Integration Testing
1. Visit the API Test Page in the application
2. Check the "Supabase Connection" test result
3. Use the Supabase Demo Page for interactive testing

### Demo Page Features
- Configuration status display
- Interactive data fetching buttons
- Search functionality
- Error handling demonstration
- Real-time results display

## Error Handling

The service includes comprehensive error handling:

1. **Environment Validation**: Checks for required variables
2. **Network Errors**: Handles connection failures gracefully
3. **Query Errors**: Processes Supabase-specific errors
4. **User Feedback**: Provides meaningful error messages

## Web Compatibility Notes

### Adaptations Made for Web Environment

1. **Removed react-native-url-polyfill**: Not needed in web browsers
2. **AsyncStorage Compatibility**: Works through polyfill in web environment
3. **Process Lock**: Custom implementation suitable for both React Native and web

### Original React Native Compatibility

To use in actual React Native (Expo) environment:

1. Add back `import 'react-native-url-polyfill/auto';` to the service
2. Ensure proper Expo configuration for AsyncStorage
3. Test on actual mobile devices

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Ensure `.env` file contains `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_KEY`
   - Check Vite configuration includes these variables

2. **"Cannot resolve react-native"**
   - This is expected in web environment - the polyfill was removed for compatibility

3. **AsyncStorage warnings**
   - Normal in web environment - the polyfill handles browser storage

### Debug Steps

1. Check environment variables in demo page
2. Review browser console for detailed error messages
3. Test with API Integration Test component
4. Verify Supabase project settings and permissions

## Security Considerations

1. **Environment Variables**: Use different keys for development/production
2. **Row Level Security**: Configure RLS policies in Supabase
3. **API Key Exposure**: Only use anon keys in frontend code
4. **Process Lock**: Prevents concurrent auth operations

## Future Enhancements

Potential improvements for the integration:

1. **Real-time Subscriptions**: Add Supabase real-time listeners
2. **File Upload**: Implement Supabase Storage integration
3. **Advanced Auth**: Add social login providers
4. **Offline Support**: Implement offline-first data sync
5. **Caching**: Add intelligent query caching

## Support

For issues related to this Supabase integration:

1. Check the demo page for configuration status
2. Review the API integration tests
3. Consult Supabase documentation for database-specific issues
4. Verify environment variable configuration
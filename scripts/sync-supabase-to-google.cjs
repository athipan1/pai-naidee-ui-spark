require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const googleService = require('../api/google-service.cjs');

/**
 * Migration script to sync data from Supabase to Google Sheets
 */
async function syncSupabaseToGoogle() {
  console.log('🚀 Starting synchronization from Supabase to Google Sheets...');

  // 1. Initialize Supabase
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials missing.');
    return;
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 2. Initialize Google Service
  const initSuccess = await googleService.init();
  if (!initSuccess) {
    console.error('❌ Google Service initialization failed.');
    return;
  }

  try {
    // 3. Fetch data from Supabase
    console.log('📡 Fetching data from Supabase...');
    const { data: places, error: placesError } = await supabase.from('places').select('*');
    if (placesError) throw placesError;

    const { data: media, error: mediaError } = await supabase.from('media').select('*');
    if (mediaError) throw mediaError;

    console.log(`📦 Found ${places.length} places and ${media.length} media items.`);

    // 4. Sync Places
    console.log('📝 Syncing places to Google Sheets...');
    const placeHeaders = [
      'id', 'name', 'name_local', 'province', 'category', 'rating', 'review_count',
      'image_url', 'description', 'tags', 'lat', 'lng', 'amenities', 'created_at', 'updated_at'
    ];

    // Clear existing sheet data by re-creating or manually if possible
    // For simplicity, we just add missing ones or append (Google Sheets doesn't have an easy "TRUNCATE")
    // In this script, we'll just append and assume the user starts with a clean sheet.

    for (const place of places) {
      await googleService.addRow('places', {
        id: place.id,
        name: place.name,
        name_local: place.name_local,
        province: place.province,
        category: place.category,
        rating: place.rating,
        review_count: place.review_count,
        image_url: place.image_url,
        description: place.description,
        tags: JSON.stringify(place.tags || []),
        lat: place.lat,
        lng: place.lng,
        amenities: JSON.stringify(place.amenities || []),
        created_at: place.created_at,
        updated_at: place.updated_at
      }, placeHeaders);
      process.stdout.write('.');
    }
    console.log('\n✅ Places synced.');

    // 5. Sync Media
    console.log('📝 Syncing media to Google Sheets...');
    const mediaHeaders = ['id', 'place_id', 'url', 'type', 'title', 'description'];

    for (const item of media) {
      await googleService.addRow('media', {
        id: item.id,
        place_id: item.place_id,
        url: item.url,
        type: item.type,
        title: item.title,
        description: item.description
      }, mediaHeaders);
      process.stdout.write('.');
    }
    console.log('\n✅ Media synced.');

    console.log('\n✨ Synchronization complete! Your Google Sheet is now up to date.');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

syncSupabaseToGoogle();

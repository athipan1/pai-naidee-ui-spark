#!/usr/bin/env tsx

// Supabase Storage Verification Script

import { createClient } from '@supabase/supabase-js';

// --- Use credentials provided by the user ---
const supabaseUrl = "https://quptneebcplnmzkyuxlu.supabase.co/";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1cHRuZWViY3Bsbm16a3l1eGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MzgyNjksImV4cCI6MjA3MTUxNDI2OX0.DU4-vgGZFl2xJS2o6EvA5rPOA0YJlwOUJ5JTzrM58yA";

// --- Main Script ---
async function checkSupabaseStorage() {
  console.log('--- Supabase Storage Verification ---');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: Supabase URL or Anon Key is not defined in the script.');
    return;
  }
  console.log('1. ✅ Using provided Supabase URL and Anon Key.');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('   - Supabase client initialized.');

  // 2. List all buckets
  console.log('\n2. Listing all available buckets...');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

  if (bucketsError) {
    console.error('   - ❌ Error listing buckets:', bucketsError.message);
    if (bucketsError.message.includes('Invalid JWT')) {
        console.error('   - ❗️ Suggestion: The provided SUPABASE_ANON_KEY might be invalid or expired.');
    }
    return;
  }

  if (!buckets || buckets.length === 0) {
    console.log('   - ⚠️ No buckets found in this project.');
    console.log('--- Verification Complete ---');
    return;
  }

  console.log(`   - ✅ Found ${buckets.length} buckets: ${buckets.map(b => b.name).join(', ')}`);

  // 3. Check for "images" bucket
  const imageBucketName = 'images';
  const imageBucket = buckets.find(b => b.name === imageBucketName);

  if (!imageBucket) {
    console.log(`\n3. ⚠️ Bucket "${imageBucketName}" not found. Trying other common names...`);
    // Attempt to find any bucket that might be used for images
    const otherImageBucket = buckets.find(b => b.name.includes('image') || b.name.includes('asset'));
    if(otherImageBucket) {
        console.log(`   - Found a possible alternative: "${otherImageBucket.name}". Please verify if this is the correct bucket.`);
    } else {
        console.log(`   - No bucket named "${imageBucketName}" or similar was found. Please ensure it exists.`);
    }
    console.log('--- Verification Complete ---');
    return;
  }

  console.log(`\n3. Checking bucket "${imageBucketName}"...`);
  console.log(`   - ✅ Bucket found. Public status: ${imageBucket.public}`);
  if(!imageBucket.public){
    console.log('   - ❗️ Suggestion: Bucket is not public. Files may not be accessible via public URLs. Please check bucket policies in your Supabase dashboard.');
  }

  // List files in the bucket
  const { data: files, error: filesError } = await supabase.storage.from(imageBucket.id).list();

  if (filesError) {
    console.error(`   - ❌ Error listing files in "${imageBucket.id}":`, filesError.message);
    return;
  }

  if (!files || files.length === 0) {
    console.log('   - ⚠️ No files found in this bucket.');
    console.log('--- Verification Complete ---');
    return;
  }
  console.log(`   - ✅ Found ${files.length} files.`);

  // 4. Test public URL generation
  const firstFile = files[0];
  console.log(`\n4. Generating public URL for a sample file: "${firstFile.name}"...`);

  const { data: publicUrlData } = supabase.storage.from(imageBucket.id).getPublicUrl(firstFile.name);

  if(publicUrlData) {
    console.log(`   - ✅ Public URL: ${publicUrlData.publicUrl}`);
  } else {
    console.log(`   - ⚠️ Could not generate public URL.`);
  }

  // 5. Final Summary
  console.log('\n5. Summary:');
  if (imageBucket && imageBucket.public && files.length > 0) {
    console.log('   - ✅ Storage appears to be ready for use in the application.');
  } else {
    console.log('   - ⚠️ Storage may not be fully configured. Please review the suggestions above.');
  }

  console.log('\n--- Verification Complete ---');
}

checkSupabaseStorage();

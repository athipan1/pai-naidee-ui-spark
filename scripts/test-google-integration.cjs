require('dotenv').config();
const googleService = require('../api/google-service.cjs');
const fs = require('fs');

async function runDiagnostics() {
  console.log('🔍 Starting Google Integration Diagnostics...');
  console.log('-------------------------------------------');

  // 1. Check Env Vars
  const envVars = {
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✅ Set' : '❌ Missing',
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY ? '✅ Set' : '❌ Missing',
    GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID ? '✅ Set' : '❌ Missing',
    GOOGLE_DRIVE_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID ? '✅ Set' : '❌ Missing',
  };
  console.table(envVars);

  if (Object.values(envVars).includes('❌ Missing')) {
    console.error('❌ Error: Required environment variables are missing in .env');
    process.exit(1);
  }

  // 2. Initialize Service
  console.log('\nStep 1: Initializing Google Service...');
  const initSuccess = await googleService.init();
  if (!initSuccess) {
    console.error('❌ Failed to initialize Google Service. Check your Private Key and Email.');
    process.exit(1);
  }
  console.log('✅ Google Service Initialized.');

  // 3. Test Google Sheets Write
  console.log('\nStep 2: Testing Google Sheets Write...');
  try {
    const testData = {
      id: 'test-' + Date.now(),
      name: 'Test Attraction',
      province: 'Bangkok',
      category: 'Test',
      created_at: new Date().toISOString()
    };
    const headers = ['id', 'name', 'province', 'category', 'created_at'];
    await googleService.addRow('places', testData, headers);
    console.log('✅ Successfully added a test row to "places" sheet.');
  } catch (error) {
    console.error('❌ Google Sheets Write Failed:', error.message);
    console.log('💡 Tip: Make sure you shared the Sheet with your Service Account Email.');
  }

  // 4. Test Google Drive Upload
  console.log('\nStep 3: Testing Google Drive Upload...');
  try {
    const dummyBuffer = Buffer.from('this is a test file content');
    const uploadResult = await googleService.uploadFile(dummyBuffer, 'test-diag.txt', 'text/plain');
    console.log('✅ Successfully uploaded test file to Google Drive.');
    console.log('🔗 Direct Link:', uploadResult.url);

    // Cleanup
    await googleService.deleteFile(uploadResult.id);
    console.log('✅ Cleaned up test file.');
  } catch (error) {
    console.error('❌ Google Drive Upload Failed:', error.message);
    console.log('💡 Tip: Make sure you shared the Drive Folder with your Service Account Email.');
  }

  console.log('\n-------------------------------------------');
  console.log('🎉 Diagnostics Completed.');
}

runDiagnostics();

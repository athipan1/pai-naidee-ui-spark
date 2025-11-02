// scripts/verify-attraction.ts
import { getSupabaseClient } from '../src/services/supabase.service';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

async function main() {
  console.log('Starting script to verify the new attraction...');
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('name', 'Cheow Lan Dam')
      .single();

    if (error) {
      throw new Error(`Failed to fetch attraction: ${error.message}`);
    }

    if (!data) {
      console.error('Attraction not found in the database.');
      process.exit(1);
    }

    console.log('Attraction found!');
    console.log(JSON.stringify(data, null, 2));

    // Verify key details
    if (data.name_local !== 'เขื่อนเชี่ยวหลาน') {
        throw new Error(`Verification failed: name_local is incorrect. Expected "เขื่อนเชี่ยวหลาน", got "${data.name_local}"`);
    }
    if (data.province !== 'Surat Thani') {
        throw new Error(`Verification failed: province is incorrect. Expected "Surat Thani", got "${data.province}"`);
    }
     if (!data.image_url.includes('cheow-lan-dam.jpg')) {
        throw new Error(`Verification failed: image_url is incorrect. Expected to include "cheow-lan-dam.jpg", got "${data.image_url}"`);
    }

    console.log('All key details verified successfully.');

  } catch (error) {
    console.error('An error occurred during verification:', error);
    process.exit(1);
  }
}

main();

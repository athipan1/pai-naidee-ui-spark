// scripts/add-attraction.ts
import { addAttraction, uploadAttractionImage } from '../src/services/admin.service';
import { AttractionDetail } from '../src/shared/types/attraction';
import dotenv from 'dotenv';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

async function main() {
  console.log('Starting script to add new attraction...');

  // 1. Define attraction data
  const attractionData: Omit<AttractionDetail, 'id' | 'reviews' | 'confidence' | 'matchedTerms' | 'lastUpdated'> = {
    name: 'Cheow Lan Dam',
    nameLocal: 'เขื่อนเชี่ยวหลาน',
    province: 'Surat Thani',
    category: 'Natural',
    image: '', // This will be replaced with the public URL from Supabase Storage
    images: [],
    description: 'Cheow Lan Dam, also known as the Ratchaprapha Dam, is a stunning reservoir in Surat Thani province, famous for its emerald waters and limestone karsts. It is often called the "Guilin of Thailand".',
    tags: ['dam', 'lake', 'national park', 'nature', 'boating'],
    amenities: ['boat tours', 'kayaking', 'floating bungalows', 'viewpoints'],
    location: {
      lat: 8.975,
      lng: 98.825,
    },
    rating: 4.8,
    reviewCount: 1234,
    coordinates: {
        lat: 8.975,
        lng: 98.825,
    }
  };

  const imagePath = resolve(__dirname, '../user_assets/cheow-lan-dam.jpg');
  const imageContent = readFileSync(imagePath);
  const imageName = basename(imagePath);
  const imageFile = new Blob([imageContent], { type: 'image/jpeg' });
  (imageFile as any).name = imageName;


  try {
    // 2. Upload the image to Supabase Storage
    console.log('Step 1: Uploading attraction image...');
    const publicUrl = await uploadAttractionImage(imageFile as File);
    console.log(`Image uploaded. Public URL: ${publicUrl}`);

    // 3. Add the attraction to the database
    attractionData.image = publicUrl;
    attractionData.images = [publicUrl];

    console.log('Step 2: Adding attraction to the database...');
    const newAttraction = await addAttraction(attractionData);
    console.log('Attraction added successfully!');
    console.log(JSON.stringify(newAttraction, null, 2));

  } catch (error) {
    console.error('An error occurred while adding the attraction:', error);
    process.exit(1);
  }
}

main();

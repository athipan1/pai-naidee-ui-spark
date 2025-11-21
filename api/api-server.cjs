require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const path = require('path');

// --- Basic Setup ---
const app = express();
const PORT = process.env.PORT || 8000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Supabase Client Setup ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL or Service Role Key is missing. Make sure to set them in the .env file.");
}
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// --- Multer Setup for File Uploads ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// ====================================================================
// --- New Media Management API Endpoints ---
// ====================================================================

/**
 * Endpoint to create a new place with media files.
 * This function now handles:
 * 1. Inserting place data into the 'places' table.
 * 2. Uploading media files to Supabase Storage.
 * 3. Inserting media metadata into the 'media' table.
 */
app.post('/api/places', upload.any(), async (req, res) => {
  const { placeData: placeDataJson, metadata: metadataJson } = req.body; // metadata from frontend
  const files = req.files;

  if (!placeDataJson || !files || files.length === 0) {
    return res.status(400).json({ error: 'Missing place data or media files.' });
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client is not initialized.' });
  }

  let newPlaceId = null;

  try {
    const placeData = JSON.parse(placeDataJson);
    // Metadata for each file should be sent as an array of JSON strings
    const mediaMetadata = metadataJson ? JSON.parse(metadataJson) : [];
    // 1. Insert place data into the 'places' table
    const { data: placeResult, error: placeError } = await supabase
      .from('places')
      .insert({
        name: placeData.placeName,
        name_local: placeData.placeNameLocal,
        province: placeData.province,
        category: placeData.category,
        description: placeData.description,
        // Supabase PostGIS format for coordinates: 'POINT(lng lat)'
        coordinates: `POINT(${placeData.coordinates.lng} ${placeData.coordinates.lat})`,
      })
      .select()
      .single();

    if (placeError) {
      throw new Error(`Supabase DB Error (places): ${placeError.message}`);
    }

    newPlaceId = placeResult.id;
    console.log(`Successfully created place with ID: ${newPlaceId}`);

    // 2. Upload files to Storage and collect metadata
    const mediaToInsert = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const metadata = mediaMetadata[i] || {}; // Get corresponding metadata
      const fileExt = path.extname(file.originalname);
      const fileName = `${newPlaceId}/${uuidv4()}${fileExt}`; // Organize files by placeId

      const { error: uploadError } = await supabase.storage
        .from('place-images')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Supabase Storage Error: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('place-images')
        .getPublicUrl(fileName);

      mediaToInsert.push({
        place_id: newPlaceId,
        url: publicUrl,
        type: file.mimetype.startsWith('video') ? 'video' : 'image',
        title: metadata.title || path.basename(file.originalname, fileExt),
        description: metadata.description || '',
      });
    }

    // 3. Insert media metadata into the 'media' table
    let insertedMedia = [];
    if (mediaToInsert.length > 0) {
        const { data: mediaResult, error: mediaError } = await supabase
            .from('media')
            .insert(mediaToInsert)
            .select();

        if (mediaError) {
            throw new Error(`Supabase DB Error (media): ${mediaError.message}`);
        }
        insertedMedia = mediaResult;
        console.log(`Successfully inserted ${insertedMedia.length} media records.`);
    }

    res.status(201).json({
      success: true,
      message: `Successfully created '${placeData.placeName}' and uploaded ${files.length} files.`,
      placeId: newPlaceId,
      mediaCount: mediaToInsert.length,
      media: insertedMedia
    });

  } catch (error) {
    console.error('Error in /api/places:', error.message);

    // Cleanup on failure: If place was created but something else failed, delete the place.
    // This is a simple form of transaction rollback.
    if (newPlaceId) {
        console.log(`Attempting to clean up created place with ID: ${newPlaceId}`);
        await supabase.from('places').delete().eq('id', newPlaceId);
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * Endpoint to get a list of all places with their media.
 */
app.get('/api/places', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client is not initialized.' });
  }
  try {
    const { data, error } = await supabase
      .from('places')
      .select('*, media(*)'); // This performs a join with the media table

    if (error) {
      throw new Error(`Supabase DB Error: ${error.message}`);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error in GET /api/places:', error.message);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * Endpoint to get a single place by its ID, including its media.
 */
app.get('/api/places/search', async (req, res) => {
    const { name, province } = req.query;
    console.log(`Searching for place: ${name}` + (province ? ` in ${province}`: ''));

    if (!supabase) {
        return res.status(500).json({ error: 'Supabase client is not initialized.' });
    }

    try {
        let query = supabase.from('places').select('*, media(*)');

        if (name) {
            query = query.ilike('name', `%${name}%`);
        }
        if (province) {
            query = query.ilike('province', `%${province}%`);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Supabase DB Error: ${error.message}`);
        }

        res.status(200).json({ places: data });
    } catch (error) {
        console.error('Error in place search:', error.message);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

app.get('/api/places/:placeId', async (req, res) => {
  const { placeId } = req.params;
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client is not initialized.' });
  }
  try {
    const { data, error } = await supabase
      .from('places')
      .select('*, media(*)') // Join with media table
      .eq('id', placeId)
      .single(); // Expect only one result

    if (error) {
      // If the error is due to no rows found, it's a 404
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Place not found.' });
      }
      throw new Error(`Supabase DB Error: ${error.message}`);
    }

    if (!data) {
      return res.status(404).json({ error: 'Place not found.' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(`Error in GET /api/places/${placeId}:`, error.message);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ... (other endpoints remain the same)

/**
 * Endpoint to update place details.
 */
app.put('/api/places/:placeId', async (req, res) => {
  const { placeId } = req.params;
  const { name, name_local, province, category, description, coordinates } = req.body;

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client is not initialized.' });
  }

  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (name_local) updateData.name_local = name_local;
    if (province) updateData.province = province;
    if (category) updateData.category = category;
    if (description) updateData.description = description;
    if (coordinates) updateData.coordinates = `POINT(${coordinates.lng} ${coordinates.lat})`;

    const { data, error } = await supabase
      .from('places')
      .update(updateData)
      .eq('id', placeId)
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase DB Error: ${error.message}`);
    }

    res.status(200).json({ success: true, message: 'Place updated successfully.', data });
  } catch (error) {
    console.error(`Error in PUT /api/places/${placeId}:`, error.message);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.post('/api/places/:placeId/media/replace', upload.any(), async (req, res) => {
    const { placeId } = req.params;
    const files = req.files;

    console.log(`Received request to replace media for place ID: ${placeId}`);
    console.log(`Received ${files ? files.length : 0} new files.`);

    // This is a complex operation. For now, we will add the new media
    // and the user can manually delete the old ones. A full implementation
    // would involve deleting old files from storage and the database.

    if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded.' });
    }

    if (!supabase) {
        return res.status(500).json({ error: 'Supabase client is not initialized.' });
    }

    try {
        const mediaToInsert = [];
        for (const file of files) {
            const fileExt = path.extname(file.originalname);
            const fileName = `${placeId}/${uuidv4()}${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('place-images')
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false,
                });

            if (uploadError) {
                throw new Error(`Supabase Storage Error: ${uploadError.message}`);
            }

            const { data: { publicUrl } } = supabase.storage
                .from('place-images')
                .getPublicUrl(fileName);

            mediaToInsert.push({
                place_id: placeId,
                url: publicUrl,
                type: file.mimetype.startsWith('video') ? 'video' : 'image',
                title: path.basename(file.originalname, fileExt),
                description: '',
            });
        }

        const { data: newMedia, error: mediaError } = await supabase
            .from('media')
            .insert(mediaToInsert)
            .select();

        if (mediaError) {
            throw new Error(`Supabase DB Error (media): ${mediaError.message}`);
        }

        res.status(200).json({
            success: true,
            message: `Successfully added ${newMedia.length} new media items.`,
            placeId,
            newMedia,
        });
    } catch (error) {
        console.error('Error in media replacement:', error.message);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

app.get('/api/places/search', async (req, res) => {
    const { name, province } = req.query;
    console.log(`Searching for place: ${name}` + (province ? ` in ${province}`: ''));

    if (!supabase) {
        return res.status(500).json({ error: 'Supabase client is not initialized.' });
    }

    try {
        let query = supabase.from('places').select('*, media(*)');

        if (name) {
            query = query.ilike('name', `%${name}%`);
        }
        if (province) {
            query = query.ilike('province', `%${province}%`);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Supabase DB Error: ${error.message}`);
        }

        res.status(200).json({ places: data });
    } catch (error) {
        console.error('Error in place search:', error.message);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

/**
 * Endpoint to delete a media item.
 */
app.delete('/api/media/:mediaId', async (req, res) => {
    const { mediaId } = req.params;
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase client is not initialized.' });
    }

    try {
        // First, get the media record to find out its URL
        const { data: media, error: getError } = await supabase
            .from('media')
            .select('url')
            .eq('id', mediaId)
            .single();

        if (getError || !media) {
            return res.status(404).json({ error: 'Media not found.' });
        }

        // Extract the file path from the URL
        const url = new URL(media.url);
        const filePath = url.pathname.split('/place-images/')[1];

        // Delete from storage
        const { error: storageError } = await supabase.storage
            .from('place-images')
            .remove([filePath]);

        if (storageError) {
            // Log the error but proceed to delete the DB record anyway
            console.error('Supabase Storage Error on delete:', storageError.message);
        }

        // Delete from database
        const { error: dbError } = await supabase
            .from('media')
            .delete()
            .eq('id', mediaId);

        if (dbError) {
            throw new Error(`Supabase DB Error: ${dbError.message}`);
        }

        res.status(200).json({ success: true, message: 'Media deleted successfully.' });
    } catch (error) {
        console.error(`Error deleting media ${mediaId}:`, error.message);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});


// ====================================================================
// --- Existing Chatbot API Endpoints ---
// ====================================================================

const sessions = new Map();

function detectLanguage(text) {
  const thaiRegex = /[\u0E00-\u0E7F]/;
  return thaiRegex.test(text) ? 'th' : 'en';
}

function generateTravelResponse(message, language, _sessionId) {
  const responses = {
    th: {
      greetings: [
        'สวัสดีครับ! ยินดีต้อนรับสู่ PaiNaiDee ครับ ผมพร้อมช่วยแนะนำสถานที่ท่องเที่ยวในประเทศไทย',
        'สวัสดีครับ! ผมเป็นผู้ช่วยการท่องเที่ยวของคุณ มีอะไรให้ช่วยเหลือเกี่ยวกับการเดินทางไหมครับ?',
        'หวัดดีครับ! อยากไปเที่ยวที่ไหนดีครับ? ผมมีสถานที่สวยๆ หลายแห่งแนะนำเลยครับ'
      ],
      northern: [
        'ภาคเหนือของไทยมีสถานที่ท่องเที่ยวสวยงามมากมาย เช่น เชียงใหม่ ดอยอินทนนท์ เชียงราย ปาย และหลวงน้ำทา แต่ละที่มีเสน่ห์แตกต่างกันครับ',
        'แนะนำให้ไปเชียงใหม่ครับ มีทั้งวัดดอยสุเทพ ถนนคนเดิน ตลาดวโรรส และภูเขาดอยอินทนนท์ที่สวยงาม',
        'ถ้าชอบธรรมชาติแนะนำปาย เชียงราย และแม่ฮ่องสอน มีทัศนียภาพภูเขาและธรรมชาติที่สวยงามมากครับ'
      ],
      food: [
        'อาหารไทยมีหลากหลายมาก แนะนำให้ลองข้าวซอย ส้มตำ แกงเขียวหวาน ผัดไทย และมะม่วงข้าวเหนียว เป็นต้นครับ',
        'ถ้าอยากลองอาหารท้องถิ่น แนะนำไปตลาดน้ำ ตลาดจตุจักร หรือถนนข้าวสาร ครับ มีอาหารอร่อยมากมาย',
        'อาหารไทยใต้แนะนำแกงส้ม ข้าวยำ หอยทอด ส่วนอาหารเหนือแนะนำข้าวซอย แคบหมู น้ำพริกหนุ่ม ครับ'
      ],
      budget: [
        'งบประมาณท่องเที่ยวประเทศไทยขึ้นอยู่กับระดับการท่องเที่ยว สำหรับนักท่องเที่ยวต่างชาติ แนะนำประมาณ 1,500-3,000 บาทต่อวัน รวมที่พัก อาหาร และการเดินทางครับ',
        'ถ้าเป็นการท่องเที่ยวแบบประหยัด ประมาณ 800-1,500 บาทต่อวัน ถ้าอยากสบายขึ้น 2,000-4,000 บาทต่อวัน ครับ',
        'สำหรับ 3 วัน 2 คืน แนะนำเตรียมงบประมาณ 4,000-8,000 บาท ขึ้นอยู่กับกิจกรรมและระดับที่พักครับ'
      ],
      general: [
        'ขอบคุณที่สนใจท่องเที่ยวประเทศไทยครับ มีคำถามอื่นๆ เกี่ยวกับการท่องเที่ยวอีกไหมครับ?',
        'ประเทศไทยมีสถานที่ท่องเที่ยวมากมาย ทั้งทะเล ภูเขา วัฒนธรรม และอาหาร อยากทราบว่าสนใจประเภทไหนครับ?',
        'ผมพร้อมให้คำแนะนำเกี่ยวกับการท่องเที่ยวไทยครับ ลองบอกว่าอยากรู้เรื่องอะไรเป็นพิเศษ'
      ]
    },
    en: {
      greetings: [
        'Hello! Welcome to PaiNaiDee, your AI travel companion for Thailand! How can I help you plan your amazing journey?',
        'Hi there! I\'m your Thai travel expert. Ready to discover some incredible destinations in Thailand?',
        'Welcome! I\'m here to help you explore the best of Thailand. What kind of adventure are you looking for?'
      ],
      northern: [
        'Northern Thailand is absolutely stunning! I recommend Chiang Mai with its beautiful temples like Doi Suthep, Chiang Rai with the White Temple, Pai for amazing mountain views, and Doi Inthanon National Park for breathtaking nature.',
        'For Northern Thailand, Chiang Mai is a must-visit! Explore the Old City, visit Doi Suthep Temple, enjoy the Sunday Walking Street, and take a day trip to Doi Inthanon, Thailand\'s highest peak.',
        'Northern Thailand offers incredible diversity: cultural sites in Chiang Mai, artistic temples in Chiang Rai, peaceful mountains in Pai, and beautiful nature in Mae Hong Son. Each place has its unique charm!'
      ],
      food: [
        'Thai cuisine is incredible! Must-try dishes include Pad Thai, Tom Yum Goong, Green Curry, Mango Sticky Rice, Som Tam (papaya salad), and Khao Soi. Each region has its own specialties too!',
        'For authentic Thai food experiences, visit floating markets, street food stalls in Bangkok, or local markets in Chiang Mai. Don\'t miss regional specialties like Northern Thai Khao Soi or Southern Thai curries!',
        'Thai food varies by region: Central Thailand offers Pad Thai and Tom Yum, Northern Thailand has Khao Soi and Sai Ua, Southern Thailand features spicy curries and fresh seafood. Each region is a culinary adventure!'
      ],
      budget: [
        'Budget for Thailand varies widely! Budget travelers can manage on $25-40 USD per day, mid-range travelers need $50-80 USD per day, and luxury travelers might spend $100-200+ USD per day, including accommodation, food, and activities.',
        'For a 3-day 2-night trip, budget around $150-300 USD for budget travel, $300-500 USD for mid-range, or $500-1000+ USD for luxury experiences. This includes accommodation, meals, transportation, and activities.',
        'Thailand offers great value! Accommodation ranges from $10-15 USD for hostels to $50-100+ USD for hotels. Street food costs $1-3 USD per meal, while restaurant meals are $5-15 USD. Transportation is very affordable!'
      ],
      general: [
        'Thailand is an amazing destination with something for everyone! Beautiful beaches, majestic mountains, rich culture, delicious food, and warm hospitality. What aspect interests you most?',
        'I\'m here to help you discover Thailand\'s wonders! Whether you\'re interested in cultural sites, natural beauty, adventure activities, or culinary experiences, I can provide personalized recommendations.',
        'Thank you for choosing Thailand as your destination! Feel free to ask me anything about places to visit, local culture, food recommendations, or travel tips. I\'m here to help!'
      ]
    }
  };

  const messageLower = message.toLowerCase();
  let category = 'general';
  
  if (messageLower.includes('northern') || messageLower.includes('north') || messageLower.includes('เหนือ') || messageLower.includes('เชียงใหม่')) {
    category = 'northern';
  } else if (messageLower.includes('food') || messageLower.includes('eat') || messageLower.includes('อาหาร') || messageLower.includes('กิน')) {
    category = 'food';
  } else if (messageLower.includes('budget') || messageLower.includes('cost') || messageLower.includes('money') || messageLower.includes('price') || messageLower.includes('ราคา') || messageLower.includes('งบ')) {
    category = 'budget';
  } else if (messageLower.includes('hello') || messageLower.includes('hi') || messageLower.includes('สวัสดี') || messageLower.includes('หวัดดี')) {
    category = 'greetings';
  }

  const categoryResponses = responses[language][category];
  const randomResponse = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
  
  return randomResponse;
}

app.post('/api/talk', (req, res) => {
  try {
    const { message, session_id, language = 'auto' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      });
    }

    const sessionId = session_id || uuidv4();
    const detectedLanguage = language === 'auto' ? detectLanguage(message) : language;
    
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        id: sessionId,
        messages: [],
        created_at: new Date().toISOString()
      });
    }
    
    const session = sessions.get(sessionId);
    
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      language: detectedLanguage
    });

    const response = generateTravelResponse(message, detectedLanguage, sessionId);
    
    session.messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
      language: detectedLanguage
    });

    const confidence = Math.random() * 0.2 + 0.8;

    res.json({
      response,
      session_id: sessionId,
      language: detectedLanguage,
      confidence,
      intent: 'travel_inquiry',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in /api/talk:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Sorry, I encountered an error. Please try again.'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'PaiNaiDee AI API is running',
    timestamp: new Date().toISOString()
  });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🤖 PaiNaiDee AI API Server running on port ${PORT}`);
  console.log(`📡 Chatbot endpoint: http://localhost:${PORT}/api/talk`);
  console.log(`🚀 Media endpoint: http://localhost:${PORT}/api/places`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;

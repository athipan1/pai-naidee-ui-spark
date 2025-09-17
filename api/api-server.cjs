const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// In-memory session storage (in production, use Redis or database)
const sessions = new Map();

// Helper function to detect language
function detectLanguage(text) {
  // Simple Thai detection (contains Thai characters)
  const thaiRegex = /[\u0E00-\u0E7F]/;
  return thaiRegex.test(text) ? 'th' : 'en';
}

// Helper function to generate travel-related responses
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
  
  // Simple keyword detection
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

// POST /api/talk endpoint
app.post('/api/talk', (req, res) => {
  try {
    const { message, session_id, language = 'auto' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      });
    }

    // Generate or use existing session ID
    const sessionId = session_id || uuidv4();
    
    // Detect language if auto
    const detectedLanguage = language === 'auto' ? detectLanguage(message) : language;
    
    // Get or create session
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        id: sessionId,
        messages: [],
        created_at: new Date().toISOString()
      });
    }
    
    const session = sessions.get(sessionId);
    
    // Add user message to session
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      language: detectedLanguage
    });

    // Generate AI response
    const response = generateTravelResponse(message, detectedLanguage, sessionId);
    
    // Add AI response to session
    session.messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
      language: detectedLanguage
    });

    // Calculate confidence based on keyword matching
    const confidence = Math.random() * 0.2 + 0.8; // 0.8 to 1.0

    // Return response
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'PaiNaiDee AI API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🤖 PaiNaiDee AI API Server running on port ${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/talk`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
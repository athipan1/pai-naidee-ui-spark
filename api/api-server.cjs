require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 8000;

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase URL or Anon Key is missing. Make sure to set them in the api/.env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// API endpoint to get attractions
app.get('/api/attractions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .limit(50); // Limiting to 50 results for now

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'PaiNaiDee API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🤖 PaiNaiDee API Server running on port ${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/attractions`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
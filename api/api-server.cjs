require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 8000;

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Get all attractions
app.get('/api/attractions', async (req, res) => {
  try {
    // For now, we fetch a limited number of places as "attractions"
    // We will use the 'places' table as it seems to be the main one.
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .limit(50); // Adjust limit as needed

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'PaiNaiDee API is running and connected to Supabase',
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
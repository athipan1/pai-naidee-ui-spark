#!/usr/bin/env node

// Script to build semantic index from mock data
// Usage: npm run build:semantic-index

const fs = require('fs');
const path = require('path');

// Mock data (in real implementation, this would load from actual data sources)
const mockPosts = [
  {
    id: '1',
    caption: 'Beautiful temple in Bangkok with amazing architecture',
    tags: ['temple', 'culture', 'bangkok', 'architecture'],
    user: { name: 'Travel Enthusiast' },
    location: { name: 'Wat Pho', nameLocal: 'วัดโพธิ์', province: 'Bangkok' },
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    caption: 'Stunning beach sunset in Phuket',
    tags: ['beach', 'sunset', 'nature', 'phuket'],
    user: { name: 'Beach Lover' },
    location: { name: 'Patong Beach', nameLocal: 'หาดป่าตอง', province: 'Phuket' },
    createdAt: '2024-01-10T15:30:00Z'
  },
  {
    id: '3',
    caption: 'Mountain hiking adventure in northern Thailand',
    tags: ['mountain', 'hiking', 'adventure', 'nature'],
    user: { name: 'Adventurer' },
    location: { name: 'Doi Suthep', nameLocal: 'ดอยสุเทพ', province: 'Chiang Mai' },
    createdAt: '2024-02-01T08:00:00Z'
  }
];

const mockLocations = [
  {
    id: 'loc1',
    name: 'Wat Pho',
    nameLocal: 'วัดโพธิ์',
    aliases: ['Temple of the Reclining Buddha'],
    description: 'Famous Buddhist temple in Bangkok',
    descriptionLocal: 'วัดพระเชตุพนวิมลมังคลารามราชวรมหาวิหาร',
    province: 'Bangkok',
    district: 'Phra Nakhon',
    category: 'temple',
    tags: ['temple', 'culture', 'historic', 'buddhist']
  },
  {
    id: 'loc2',
    name: 'Patong Beach',
    nameLocal: 'หาดป่าตอง',
    aliases: ['Patong'],
    description: 'Popular beach destination in Phuket',
    descriptionLocal: 'หาดที่มีชื่อเสียงในจังหวัดภูเก็ต',
    province: 'Phuket',
    district: 'Kathu',
    category: 'beach',
    tags: ['beach', 'swimming', 'nightlife', 'tourism']
  },
  {
    id: 'loc3',
    name: 'Doi Suthep',
    nameLocal: 'ดอยสุเทพ',
    aliases: ['Doi Suthep-Pui National Park'],
    description: 'Mountain and national park near Chiang Mai',
    descriptionLocal: 'อุทยานแห่งชาติดอยสุเทพ-ปุย',
    province: 'Chiang Mai',
    district: 'Mueang Chiang Mai',
    category: 'mountain',
    tags: ['mountain', 'temple', 'viewpoint', 'national park']
  }
];

// Simple mock embedding function (deterministic for testing)
function generateMockEmbedding(text) {
  const cleanText = text.toLowerCase().trim();
  const dimensions = 384; // Standard dimension for many embedding models
  const vector = new Array(dimensions);
  
  // Create deterministic features based on text content
  for (let i = 0; i < dimensions; i++) {
    const charIndex = i % cleanText.length;
    const char = cleanText.charCodeAt(charIndex) || 0;
    
    // Combine multiple features for richer representation
    let value = Math.sin((char * 0.01) + (i * 0.1));
    value += Math.cos(cleanText.length * 0.1 + i * 0.05);
    
    // Normalize to [-1, 1] range
    vector[i] = Math.tanh(value);
  }
  
  // Normalize vector to unit length
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return vector;
  
  return vector.map(val => val / magnitude);
}

// Extract content for embedding
function extractPostContent(post) {
  const parts = [];
  
  if (post.caption) parts.push(post.caption);
  if (post.tags) parts.push(post.tags.join(' '));
  if (post.location) {
    parts.push(post.location.name);
    if (post.location.nameLocal) parts.push(post.location.nameLocal);
    if (post.location.province) parts.push(post.location.province);
  }
  if (post.user?.name) parts.push(post.user.name);
  
  return parts.join(' ').trim();
}

function extractLocationContent(location) {
  const parts = [];
  
  parts.push(location.name);
  if (location.nameLocal) parts.push(location.nameLocal);
  if (location.aliases) parts.push(...location.aliases);
  if (location.description) parts.push(location.description);
  if (location.descriptionLocal) parts.push(location.descriptionLocal);
  parts.push(location.province);
  if (location.district) parts.push(location.district);
  parts.push(location.category);
  if (location.tags) parts.push(location.tags.join(' '));
  
  return parts.join(' ').trim();
}

// Build semantic index
function buildSemanticIndex() {
  console.log('Building semantic index...');
  
  const documents = [];
  
  // Process posts
  for (const post of mockPosts) {
    const content = extractPostContent(post);
    const embedding = generateMockEmbedding(content);
    
    documents.push({
      id: post.id,
      type: 'post',
      content,
      embedding,
      metadata: {
        title: post.caption.substring(0, 100),
        tags: post.tags,
        language: content.includes('วัด') || content.includes('หาด') ? 'th' : 'en',
        lastUpdated: post.createdAt
      }
    });
  }
  
  // Process locations
  for (const location of mockLocations) {
    const content = extractLocationContent(location);
    const embedding = generateMockEmbedding(content);
    
    documents.push({
      id: location.id,
      type: 'location',
      content,
      embedding,
      metadata: {
        title: location.nameLocal || location.name,
        tags: location.tags,
        category: location.category,
        language: location.nameLocal ? 'th' : 'en',
        lastUpdated: new Date().toISOString()
      }
    });
  }
  
  const index = {
    documents,
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    embeddingDimensions: 384,
    totalDocuments: documents.length
  };
  
  return index;
}

// Main execution
function main() {
  try {
    console.log('=== Semantic Index Builder ===');
    console.log('Processing posts:', mockPosts.length);
    console.log('Processing locations:', mockLocations.length);
    
    const index = buildSemanticIndex();
    
    // Save to file
    const outputPath = path.join(__dirname, '..', 'semanticIndex.json');
    fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));
    
    console.log('✅ Semantic index built successfully!');
    console.log(`📁 Saved to: ${outputPath}`);
    console.log(`📊 Total documents: ${index.totalDocuments}`);
    console.log(`🔢 Embedding dimensions: ${index.embeddingDimensions}`);
    console.log(`📅 Created: ${index.createdAt}`);
    
    // Add to .gitignore if not already there
    const gitignorePath = path.join(__dirname, '..', '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      if (!gitignoreContent.includes('semanticIndex.json')) {
        fs.appendFileSync(gitignorePath, '\n# Semantic search index\nsemanticIndex.json\n');
        console.log('📝 Added semanticIndex.json to .gitignore');
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to build semantic index:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { buildSemanticIndex, generateMockEmbedding };
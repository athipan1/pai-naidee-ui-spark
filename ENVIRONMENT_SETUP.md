# Environment Setup Instructions

## 🌍 Environment Variables for Vercel Deployment

### Required Environment Variables

Add these environment variables in your Vercel dashboard (Settings → Environment Variables):

#### Production Variables
```bash
VITE_API_BASE_URL=/api
VITE_APP_TITLE=PaiNaiDee - Discover Thailand's Hidden Gems
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
VITE_ENABLE_SW=true
```

#### Preview/Development Variables
```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_TITLE=PaiNaiDee - Development
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PWA=false
VITE_ENABLE_SW=false
```

### 🔧 Vercel Build Settings

In your Vercel project settings:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node.js Version**: 18.x

### 📝 Environment Variables Explanation

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL for API calls | `/api` (production), `http://localhost:5000/api` (dev) |
| `VITE_APP_TITLE` | Application title shown in browser | `PaiNaiDee` |
| `VITE_APP_VERSION` | Application version | `1.0.0` |
| `VITE_ENVIRONMENT` | Current environment | `production` or `development` |
| `VITE_ENABLE_DEBUG` | Enable debug logging | `false` (production), `true` (dev) |
| `VITE_ENABLE_ANALYTICS` | Enable analytics tracking | `true` (production), `false` (dev) |
| `VITE_ENABLE_PWA` | Enable PWA features | `true` (production), `false` (dev) |
| `VITE_ENABLE_SW` | Enable service worker | `true` (production), `false` (dev) |

### 🚀 Quick Setup Script

Copy and paste this into your terminal to set up environment variables locally:

```bash
# Create production environment file
cat > .env.production << EOF
VITE_API_BASE_URL=/api
VITE_APP_TITLE=PaiNaiDee - Discover Thailand's Hidden Gems
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
VITE_ENABLE_SW=true
EOF

echo "✅ Production environment file created!"
```

### 🔍 Testing Environment Configuration

To test your environment configuration:

1. **Local Development**:
   ```bash
   npm run dev
   ```

2. **Production Build**:
   ```bash
   npm run build
   npm run preview
   ```

3. **Debug Mode** (to see configuration in console):
   ```bash
   VITE_ENABLE_DEBUG=true npm run build
   npm run preview
   ```

### 🛠️ Troubleshooting

#### Missing Variables
If you see errors like "undefined environment variable", check:
1. Variable name starts with `VITE_`
2. Variable is set in Vercel dashboard
3. Deployment was triggered after setting variables

#### Wrong Values
If variables have incorrect values:
1. Check for typos in variable names
2. Verify values in Vercel dashboard
3. Redeploy after making changes

#### Local vs Production Differences
To test production-like environment locally:
```bash
npm run build:production
npm run preview
```

This will use the production environment file.
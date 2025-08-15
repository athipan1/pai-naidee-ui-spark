# Deployment Troubleshooting Guide

## 🚨 Blank Page Issues on Vercel

This guide helps debug and fix blank page issues when deploying Vite + React applications to Vercel.

### 🔍 Quick Diagnosis

1. **Check Browser Console**: Open DevTools (F12) and look for errors in the Console tab
2. **Check Network Tab**: Look for failed requests (404, 500 errors)
3. **Check Environment Variables**: Ensure all required variables are set in Vercel dashboard

### 🛠️ Common Fixes

#### 1. Environment Variables
Ensure these are set in your Vercel dashboard:
```
VITE_API_BASE_URL=/api
VITE_APP_TITLE=PaiNaiDee - Discover Thailand's Hidden Gems
VITE_ENVIRONMENT=production
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
```

#### 2. Build Settings
In Vercel dashboard:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### 3. SPA Routing
The `vercel.json` file should have:
```json
{
  "rewrites": [
    {
      "source": "/((?!api|_next|_static|favicon.ico|sitemap.xml|robots.txt).*)",
      "destination": "/index.html"
    }
  ]
}
```

### 🚀 Deployment Steps

1. **Environment Setup**:
   - Copy `.env.production` values to Vercel dashboard
   - Set `NODE_ENV=production`

2. **Build Verification**:
   ```bash
   npm run build
   npm run preview
   ```

3. **Error Monitoring**:
   - Check browser console for JavaScript errors
   - Monitor network requests for API failures
   - Use Vercel Function logs for server-side issues

### 🔧 Advanced Debugging

#### Enable Debug Mode in Production
Temporarily set `VITE_ENABLE_DEBUG=true` in Vercel to see detailed logs.

#### Check Service Worker
If PWA features cause issues:
1. Set `VITE_ENABLE_PWA=false`
2. Clear browser cache
3. Redeploy

#### Runtime Error Detection
The app includes global error handlers that log to console. Check browser DevTools for detailed error information.

### 📱 Mobile Testing
- Test on actual mobile devices
- Check touch interactions
- Verify responsive layout
- Test offline functionality (PWA)

### 🎯 Success Checklist

- [ ] App loads without blank page
- [ ] All routes work correctly
- [ ] No console errors
- [ ] Mobile experience works
- [ ] PWA features function (if enabled)
- [ ] Performance is acceptable
- [ ] Analytics tracking works (if enabled)
# PaiNaiDee Development Guide

## เริ่มพัฒนา (Start Development)

This guide will help you set up and start developing the PaiNaiDee tourism application.

## 🚀 Quick Start

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager
- Git

### Installation & Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd pai-naidee-ui-spark

# Install dependencies
npm install

# Start development server
npm run dev

# Start development server with debug tools
npm run dev:debug
```

## 🛠️ Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:debug` | Start with debug tools enabled |
| `npm run build` | Build for production |
| `npm run build:dev` | Build for development |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors automatically |
| `npm run type-check` | Run TypeScript type checking |
| `npm run preview` | Preview production build |

## 🧰 Development Tools

### Debug Mode
When running `npm run dev:debug`, you'll have access to development tools:

- **🛠️ Dev Tools Button**: Click the wrench icon in the bottom-right corner
- **Environment Info**: View current environment settings
- **Clear Storage**: Reset all localStorage data
- **Log App State**: Output current application state to console

### Environment Variables

Create a `.env.development` file with:
```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_TITLE=PaiNaiDee - Development
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false
```

## 📁 Project Structure

```
src/
├── app/                    # Main application
│   ├── pages/             # Route components
│   ├── styles/            # Global styles
│   └── App.tsx            # Main app component
├── components/            # Reusable components
│   ├── common/           # Common UI components
│   ├── dev/              # Development tools
│   └── ui/               # shadcn-ui components
├── shared/               # Shared utilities
│   ├── contexts/         # React contexts
│   ├── utils/            # Utility functions
│   └── assets/           # Static assets
└── main.tsx              # Application entry point
```

## 🎨 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn-ui
- **Routing**: React Router v6
- **State Management**: React Hooks + Context
- **Development**: ESLint + TypeScript

## 🌍 Internationalization

The app supports Thai (th) and English (en) languages:

```typescript
import { APP_CONFIG } from '@/shared/utils/constants';

// Use supported languages
APP_CONFIG.SUPPORTED_LANGUAGES; // ['en', 'th']
APP_CONFIG.DEFAULT_LANGUAGE;    // 'en'
```

## 📱 Features

### Implemented Features
- ✅ Responsive design (mobile-first)
- ✅ Multi-language support (Thai/English)
- ✅ Tourism attraction discovery
- ✅ Category-based filtering
- ✅ Search functionality
- ✅ Favorites system
- ✅ Navigation (header + bottom nav)
- ✅ Attraction detail pages

### Development Features
- ✅ Hot reload development server
- ✅ TypeScript support
- ✅ ESLint configuration
- ✅ Debug tools (development mode)
- ✅ Environment configuration

## 🔧 Development Tips

1. **Use Dev Tools**: Enable debug mode to access development utilities
2. **Hot Reload**: Changes are automatically reflected in the browser
3. **TypeScript**: Take advantage of type checking for better code quality
4. **Responsive Design**: Test on different screen sizes using browser dev tools
5. **Linting**: Run `npm run lint:fix` to automatically fix code style issues

## 🚦 Getting Started with Development

1. **Setup Environment**: Follow the installation steps above
2. **Start Dev Server**: Run `npm run dev:debug`
3. **Open Browser**: Navigate to http://localhost:8080
4. **Enable Dev Tools**: Click the 🛠️ button in the bottom-right corner
5. **Start Coding**: Make changes to files in the `src/` directory

## 📋 Next Development Tasks

- [ ] Add comprehensive testing (Jest + React Testing Library)
- [ ] Implement API integration for real data
- [ ] Add user authentication system
- [ ] Enhance search with filters and sorting
- [ ] Add booking/planning features
- [ ] Implement offline support
- [ ] Add performance monitoring
- [ ] Create admin dashboard

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes following the existing code style
3. Run `npm run lint` and `npm run type-check`
4. Test your changes thoroughly
5. Submit a pull request

## 📝 Notes

- The application is designed mobile-first
- All components are responsive and accessible
- Thai translations are integrated throughout the app
- Development tools are only available in development mode
- Production builds are optimized and minified
# PaiNaiDee - Thailand Tourism Discovery App

<div align="center">
  <img src="public/favicon.ico" alt="PaiNaiDee Logo" width="80" height="80">
  
  **Discover Amazing Places in Thailand** 🇹🇭
  
  A modern, responsive web application for exploring Thailand's beautiful attractions, culture, and experiences.
</div>

## 🌟 Features

- **🗺️ Interactive Maps** - Explore attractions with integrated Leaflet maps
- **🔍 Smart Search** - Find places by name, category, or location
- **❤️ Favorites System** - Save and organize your favorite destinations
- **🏷️ Category Filtering** - Browse by temples, beaches, markets, mountains, and more
- **📱 Mobile-First Design** - Optimized for all devices and screen sizes
- **🌍 Multi-Language Support** - Available in Thai and English
- **🎨 Modern UI** - Beautiful interface built with shadcn-ui and Tailwind CSS
- **⚡ Fast Performance** - Built with Vite for optimal loading speed

## 🚀 Quick Start

### Prerequisites

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Git**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/athipan1/pai-naidee-ui-spark.git

# 2. Navigate to project directory
cd pai-naidee-ui-spark

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev

# 5. Open your browser and visit http://localhost:8080
```

The application will be available at `http://localhost:8080` with hot reload enabled.

## 🛠️ Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:debug` | Start server with debug tools enabled |
| `npm run build` | Build for production |
| `npm run build:dev` | Build for development |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors automatically |
| `npm run type-check` | Run TypeScript type checking |
| `npm run preview` | Preview production build |

### Development Tools

When running in debug mode (`npm run dev:debug`), you'll have access to:
- **🛠️ Dev Tools Panel** - Click the wrench icon in the bottom-right corner
- **Environment Information** - View current settings and configuration
- **Storage Management** - Clear localStorage and application state
- **Console Logging** - Enhanced debugging output

### Environment Configuration

Create a `.env.development` file for local development:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_TITLE=PaiNaiDee - Development
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false
```

## 📁 Project Structure

```
pai-naidee-ui-spark/
├── src/
│   ├── app/                    # Main application
│   │   ├── pages/             # Route components
│   │   │   ├── Index.tsx      # Home page
│   │   │   ├── Explore.tsx    # Exploration page
│   │   │   ├── Favorites.tsx  # Favorites management
│   │   │   ├── MapPage.tsx    # Interactive map view
│   │   │   └── ...           # Other pages
│   │   └── App.tsx            # Main app component
│   ├── components/            # Reusable components
│   │   ├── common/           # Common UI components
│   │   ├── attraction/       # Attraction-specific components
│   │   ├── ui/               # shadcn-ui components
│   │   └── dev/              # Development tools
│   ├── shared/               # Shared utilities
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── utils/            # Utility functions
│   │   └── assets/           # Static assets
│   └── main.tsx              # Application entry point
├── public/                   # Static assets
├── docs/                     # Documentation
├── build/                    # Production build output
└── package.json              # Project dependencies
```

## 🏗️ Technology Stack

### Core Technologies
- **[React 18](https://react.dev/)** - Modern React with hooks and concurrent features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript development
- **[Vite](https://vitejs.dev/)** - Fast build tool and development server

### UI & Styling
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful and accessible component library
- **[Radix UI](https://www.radix-ui.com/)** - Low-level UI primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

### Functionality
- **[React Router v6](https://reactrouter.com/)** - Client-side routing
- **[TanStack Query](https://tanstack.com/query/)** - Data fetching and caching
- **[React Leaflet](https://react-leaflet.js.org/)** - Interactive maps
- **[React Hook Form](https://react-hook-form.com/)** - Form management
- **[Zod](https://zod.dev/)** - Schema validation

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting and quality
- **[Prettier](https://prettier.io/)** - Code formatting
- **[TypeScript](https://www.typescriptlang.org/)** - Static type checking

## 🐳 Docker Development

PaiNaiDee supports Docker for both development and production environments. See [DOCKER_README.md](./DOCKER_README.md) for detailed Docker usage instructions.

**Quick Start with Docker:**

```bash
# Development with hot reload
docker compose up dev

# Production build
docker compose up app
```

## 🌍 Internationalization

The application supports multiple languages:

- **English (en)** - Primary language
- **Thai (th)** - Native language support

Language switching is available in the user interface, and the application automatically detects user preferences.

## 🚀 Deployment

### Production Build

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

### Deployment Options

1. **Static Hosting** - Deploy the `build/` folder to any static hosting service
2. **Docker** - Use the provided Dockerfile for containerized deployment
3. **Lovable Platform** - Direct deployment through Lovable (see original setup)

### Environment Variables for Production

```bash
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_APP_TITLE=PaiNaiDee
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
```

## 🤝 Contributing

We welcome contributions to PaiNaiDee! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following our coding standards
4. Run tests and linting: `npm run lint && npm run type-check`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to your branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Guidelines
- Follow the existing code style and patterns
- Write meaningful commit messages
- Add TypeScript types for new code
- Test your changes on different screen sizes
- Update documentation if needed

### Code Style
- Use TypeScript for all new code
- Follow the existing component structure
- Use Tailwind CSS for styling
- Keep components small and focused
- Write descriptive variable and function names

## 📋 Roadmap

### Completed ✅
- Responsive design (mobile-first)
- Multi-language support (Thai/English)
- Tourism attraction discovery
- Category-based filtering
- Search functionality
- Favorites system
- Interactive maps integration
- Modern UI with shadcn-ui

### In Progress 🚧
- Enhanced search with advanced filters
- Performance optimizations
- Accessibility improvements

### Planned 📅
- User authentication system
- Booking and planning features
- Offline support (PWA)
- Social sharing capabilities
- Admin dashboard
- API integration for real-time data
- Mobile app (React Native)

## 🔧 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill process using port 8080
lsof -ti:8080 | xargs kill -9
# Or use a different port
npm run dev -- --port 3000
```

**Build errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors**
```bash
# Run type checking
npm run type-check
```

**Linting issues**
```bash
# Auto-fix linting errors
npm run lint:fix
```

### Getting Help

- 📖 Check the [DEV_README.md](./DEV_README.md) for detailed development guide
- 🐳 See [DOCKER_README.md](./DOCKER_README.md) for Docker-specific help
- 🐛 Open an issue for bugs or feature requests
- 💡 Start a discussion for questions and ideas

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Lovable](https://lovable.dev/)** - Initial project scaffolding and deployment platform
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful component library
- **[Radix UI](https://www.radix-ui.com/)** - Accessible UI primitives
- **Thailand Tourism Authority** - Inspiration for promoting Thai tourism

---

<div align="center">
  <p>Made with ❤️ for Thailand Tourism</p>
  <p>
    <a href="#-features">Features</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-development">Development</a> •
    <a href="#-contributing">Contributing</a>
  </p>
</div>

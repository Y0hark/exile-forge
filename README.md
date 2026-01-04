# ExileForge - AI-Powered Path of Exile 2 Build Generator

![Project Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-ISC-blue)

**ExileForge** is an AI-powered build generator for Path of Exile 2 that creates optimized character builds with detailed leveling guides, gear progressions, and passive tree paths. Built with a dark "Eternal Empire" aesthetic inspired by the game's lore.

## 🎮 Features

- **AI-Powered Build Generation**: Uses OpenRouter (Claude, Grok) to create viable PoE2 builds
- **Detailed Leveling Guides**: Step-by-step progression from level 1 to endgame
- **Gear Recommendations**: Budget-aware equipment suggestions with alternatives
- **Passive Tree Paths**: Optimized skill tree progression by level ranges
- **Build Analysis**: Strengths, weaknesses, and performance ratings
- **User Accounts**: Save and manage your builds
- **Dark Theme**: Beautiful Eternal Empire themed UI

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)
- OpenRouter API key ([get one here](https://openrouter.ai))

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd exileforge

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# Backend (.env)
DATABASE_URL=postgresql://admin:password@localhost:5432/exileforge
OPENROUTER_API_KEY=your-api-key-here
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
PORT=3000

# Frontend (.env.local)
VITE_API_URL=http://localhost:3000
```

### 3. Start Services

#### Option A: Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Option B: Manual Setup

```bash
# Terminal 1: Start PostgreSQL
docker-compose up -d postgres

# Terminal 2: Start backend
cd backend
npm run dev

# Terminal 3: Start frontend
cd frontend
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 📁 Project Structure

```
exileforge/
├── backend/              # Node.js + Express backend
│   ├── src/
│   │   ├── server.ts     # Main Express server
│   │   ├── middleware/   # Auth, error handling
│   │   ├── routes/       # API endpoints
│   │   └── services/     # OpenRouter AI integration
│   └── Dockerfile
│
├── frontend/             # Vue3 + Vite frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── views/        # Pages
│   │   ├── stores/       # Pinia state management
│   │   └── api/          # API client
│   └── Dockerfile
│
├── database/
│   └── schema.sql        # PostgreSQL schema
│
└── docker-compose.yml    # Service orchestration
```

## 🛠️ Tech Stack

**Backend**:
- Node.js 18+ with TypeScript
- Express.js (web framework)
- PostgreSQL (database)
- JWT (authentication)
- bcrypt (password hashing)
- OpenRouter API (AI build generation)

**Frontend**:
- Vue 3 (Composition API)
- Vite (build tool)
- TypeScript
- Pinia (state management)
- Tailwind CSS (styling)
- Axios (HTTP client)

## 📖 API Documentation

### Authentication

- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh` - Refresh JWT token

### Builds

- `POST /api/builds/generate` - Generate new build with AI
- `GET /api/builds/:id` - Get build by ID
- `GET /api/builds/user/:userId` - List user's builds
- `GET /api/builds/public` - List public builds
- `PUT /api/builds/:id` - Update build (owner only)
- `DELETE /api/builds/:id` - Delete build (owner only)
- `POST /api/builds/:id/publish` - Make build public

### Preferences

- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update preferences

## 🎨 Design System

ExileForge uses the **Eternal Empire** theme inspired by Aggorat (Act 3):

**Colors**:
- Primary: Deep Eternal Black (#1a1a2e)
- Accent: Eternal Gold (#d4af37)
- Danger: Blood Red (#8b0000)
- Background: Void Black (#0f0f1e)

**Typography**:
- Headings: Cinzel (serif, majestic)
- Body: Inter (sans-serif, modern)
- Code: JetBrains Mono

## 🧪 Development

### Running Tests

```bash
# Backend tests (when implemented)
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

### Building for Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## 📝 Current Status

**✅ Completed**:
- Project structure and setup
- Backend API with authentication
- Database schema and migrations
- Build CRUD operations
- Docker containerization
- Eternal Empire theme CSS
- Frontend scaffolding

**🔨 In Progress**:
- OpenRouter AI integration
- Frontend components and views
- Pinia store setup

**📋 Planned**:
- Build generation UI
- Leveling guide display
- Gear progression charts
- Passive tree visualization
- User profiles and saved builds

## 🤝 Contributing

This project is currently in early development. Contributions will be welcome once the MVP is complete.

## 📄 License

ISC License - See LICENSE file for details

## 🙏 Acknowledgments

- Path of Exile 2 by Grinding Gear Games
- OpenRouter for AI API access
- Vue.js and the amazing web development community

---

**Built with ❤️ for the Path of Exile community**

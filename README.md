# AREA MVP - Action REAction Platform

Minimum Viable Product for an automation platform similar to IFTTT/Zapier. Users can create automations by connecting triggers (Actions) to tasks (REActions) across different services.

## 🏗️ MVP Architecture

```
area-mvp/
├── 🔧 backend/              # Next.js API Server (Port 8080)
│   ├── pages/api/          # REST API endpoints
│   ├── src/                # Core business logic
│   └── scripts/            # Database utilities
├── 🌐 frontend/web/         # React Web Client (Port 8081)
│   ├── src/                # React components
│   └── public/             # Static assets
├── 🔄 shared/               # Common types & utilities
└── 📚 docs/                 # Project documentation
```

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Backend configuration
cp backend/.env.example backend/.env
# Edit backend/.env with your Supabase credentials
```

### 2. Install Dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend/web && npm install
```

### 3. Development Mode
```bash
# Option 1: Both services together
npm run dev

# Option 2: Separate terminals
npm run dev:backend    # Terminal 1
npm run dev:web        # Terminal 2
```

## 🎯 MVP Features

### ✅ Current Implementation
- **Backend API** - Complete REST API with Next.js
- **User Authentication** - Registration, login with JWT
- **Frontend Interface** - React web application
- **Service Architecture** - Pluggable service system
- **Basic Automation** - Area creation and management
- **Database Integration** - Supabase PostgreSQL

### 🔄 Core Functionality
- User registration and authentication
- Service connection management
- Area (automation) creation
- Basic hook system for triggers
- Web interface for all operations

## 📡 API Endpoints

### Public
- `GET /api/about.json` - Server information

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication

### Protected (JWT Required)
- `GET /api/services` - Available services
- `GET /api/areas` - User automations
- `POST /api/areas` - Create automation
- `GET /api/users/services` - Connected services

## 🔧 Technology Stack

### Backend
- **Next.js 14** - API framework
- **TypeScript** - Type safety
- **Supabase** - PostgreSQL database
- **JWT** - Authentication

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first styling

## 🚢 Development

### Quick Start Scripts
```bash
# Lancer tout ensemble (recommandé)
./start_all.sh

# Lancer individuellement
./start_backend.sh       # Backend seul
./start_web.sh          # Frontend seul
```

### Manual Commands
```bash
# Development
npm run dev              # Both backend + frontend
npm run dev:backend      # Backend only
npm run dev:web         # Frontend only

# Production Build
npm run build           # Both projects
npm run build:backend   # Backend only
npm run build:web      # Frontend only

# Production Start
npm run start          # Both services
```

### URLs
- **Backend API**: http://localhost:8080
- **Frontend Web**: http://localhost:8081

## 📋 MVP Requirements

✅ **REST API** - Complete backend implementation  
✅ **User Management** - Registration, authentication  
✅ **Web Interface** - React frontend  
✅ **Service Architecture** - Pluggable services  
✅ **Basic Automation** - Area creation  
✅ **Database** - Supabase integration  
✅ **Authentication** - JWT tokens  
✅ **Required Endpoints** - /about.json compliance  

## 🎯 Next Steps

1. **Service Integration** - Add real services (Gmail, GitHub, etc.)
2. **OAuth Implementation** - Third-party authentication
3. **Advanced Triggers** - Webhook support
4. **UI Enhancement** - Better user experience
5. **Mobile Support** - React Native app
6. **Deployment** - Docker containerization

## 📚 Documentation

- [Backend API](./backend/README.md) - Detailed API documentation
- [Frontend Guide](./frontend/web/README.md) - Frontend development guide
- [Project Specification](./docs/reference/) - Original requirements

## 📄 License

Educational project for Epitech - Area Module
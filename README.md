# AREA - Action REAction Platform

A comprehensive automation platform similar to IFTTT/Zapier, allowing users to create automations by connecting triggers (Actions) to tasks (REActions) across different services.

## 🏗️ Project Architecture

```
area/
├── backend/              # Next.js API Server (Port 8080)
│   ├── pages/api/       # REST API endpoints
│   ├── src/             # Core business logic
│   └── scripts/         # Database utilities
├── frontend/
│   ├── web/             # React Web Client (Port 8081)
│   └── mobile/          # Mobile App (Android/iOS)
├── shared/              # Common types & utilities
├── infrastructure/      # Docker, DB, deployment
│   ├── docker/         # Docker configurations
│   ├── database/       # Database schemas
│   ├── deployment/     # Deployment scripts
│   └── monitoring/     # Monitoring setup
└── docs/               # Project documentation
```

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy environment template
cp infrastructure/.env.example backend/.env
# Edit backend/.env with your Supabase credentials
```

### 2. Database Setup
```bash
# Execute in Supabase SQL editor
infrastructure/database/schema.sql
```

### 3. Development Mode
```bash
# Backend API
cd backend && npm install && npm run dev

# Web Frontend (future)
cd frontend/web && npm install && npm run dev

# Mobile App (future)
cd frontend/mobile && npm install && npm run build
```

### 4. Docker Deployment
```bash
cd infrastructure/docker
docker-compose up --build
```

## 🎯 Core Features

### ✅ MVP (Current)
- **User Authentication** - Registration, login with JWT
- **Service Management** - Pluggable service architecture
- **Area Creation** - Link actions to reactions
- **Hook Engine** - Polling-based automation execution
- **REST API** - Complete backend API
- **Docker Support** - Containerized deployment

### 🔄 In Development
- **Web Frontend** - React-based user interface
- **Mobile App** - Android application
- **OAuth Integration** - Google, GitHub, Facebook
- **Real-time Webhooks** - Event-driven triggers
- **Advanced Services** - Email, Calendar, Social Media

## 📡 API Overview

### Public Endpoints
- `GET /api/about.json` - Server information (required by project)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication

### Protected Endpoints (JWT Required)
- `GET /api/services` - Available services
- `GET /api/areas` - User automations
- `POST /api/areas` - Create automation
- `POST /api/hooks/start` - Start automation engine

## 🔧 Technology Stack

### Backend
- **Next.js 14** - API framework
- **TypeScript** - Type safety
- **Supabase** - PostgreSQL database
- **JWT** - Authentication
- **Docker** - Containerization

### Frontend (Planned)
- **React** - Web interface
- **React Native** - Mobile app
- **Tailwind CSS** - Styling

### Infrastructure
- **Docker Compose** - Multi-service orchestration
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Primary database

## 🗄️ Database Schema

Complete schema with 15+ tables supporting:
- User management and authentication
- Service definitions and configurations
- Area (automation) management
- Hook execution and logging
- OAuth integration support

## 🐳 Docker Services

As per project requirements:
- **server** - Backend API on port 8080
- **client_web** - Web client on port 8081
- **client_mobile** - Mobile app build

## 📋 Project Requirements Compliance

✅ **REST API** - Complete backend implementation  
✅ **User Management** - Registration, authentication  
✅ **Service Architecture** - Pluggable services  
✅ **Automation Engine** - Areas with actions/reactions  
✅ **Hook System** - Polling and webhook support  
✅ **Docker Deployment** - Multi-service setup  
✅ **Required Endpoints** - /about.json compliance  
✅ **Port Configuration** - 8080 (API), 8081 (Web)  

## 🚢 Deployment

### Local Development
1. Configure `.env` in backend/
2. Run `npm run dev` in backend/
3. Access API at http://localhost:8080

### Docker Production
1. Configure environment in `infrastructure/docker/.env`
2. Run `docker-compose up --build`
3. Access services at specified ports

## 📚 Documentation

- [Backend API](./backend/README.md) - Detailed API documentation
- [Database Schema](./infrastructure/database/schema.sql) - Complete DB structure
- [Project Specification](./docs/reference/) - Original requirements

## 🤝 Contributing

1. Follow the established architecture
2. Add new services in `backend/src/services/`
3. Update API documentation
4. Test with provided endpoints
5. Follow TypeScript conventions

## 📄 License

Educational project for Epitech - Area Module
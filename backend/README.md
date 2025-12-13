# AREA Backend API

Backend server built with Next.js providing REST API endpoints for the AREA platform.

## 🏗️ Architecture

```
backend/
├── pages/api/          # API endpoints (Next.js App Router)
│   ├── auth/          # Authentication endpoints
│   ├── services/      # Service management
│   ├── areas/         # Area (automation) management
│   ├── hooks/         # Hook management
│   └── about.json.ts  # Required project endpoint
├── src/
│   ├── lib/           # Core libraries
│   │   ├── supabase.ts   # Database client
│   │   └── auth.ts       # JWT utilities
│   ├── middleware/    # Request middleware
│   │   └── auth.ts       # Authentication middleware
│   ├── services/      # Business logic
│   │   └── hookEngine.ts # Automation engine
│   └── types/         # TypeScript definitions
│       └── database.ts   # Database types
└── scripts/           # Utilities & seeding
    └── seed-database.ts  # Database seeding
```

## 🚀 Quick Start

```bash
cd backend
npm install
npm run dev
```

## 📡 API Endpoints

### Public
- `GET /api/about.json` - Server information

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication

### Protected (requires JWT token)
- `GET /api/services` - List services
- `GET /api/users/services` - User connected services
- `GET /api/areas` - User automations
- `POST /api/areas` - Create automation
- `POST /api/hooks/start` - Start hook engine

## 🔧 Configuration

Environment variables in `.env`:
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
```

## 🐳 Docker

```bash
docker build -t area-backend .
docker run -p 8080:8080 area-backend
```
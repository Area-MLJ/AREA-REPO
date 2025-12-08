# AREA Web Client

React/Vite web application for the AREA platform providing a modern, responsive interface.

## 🎯 Purpose

Web interface for users to:
- Create and manage automations (Areas)
- Connect and configure services
- Monitor automation executions  
- Manage account settings

## 🏗️ Architecture

```
frontend/web/
├── src/
│   ├── App/              # Main app components
│   ├── DesignSystem/     # UI components & styling
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── package.json          # Dependencies
└── vite.config.ts        # Vite configuration
```

## 🚀 Development

```bash
cd frontend/web
npm install
npm run dev
```

Serves on http://localhost:8081 (as per project requirements)

## 🔧 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **Supabase JS** - Backend integration

## 📱 Features

- ✅ Modern React architecture with hooks
- ✅ Responsive design with Tailwind CSS
- ✅ TypeScript for type safety
- ✅ Fast development with Vite HMR
- ✅ Component-based design system
- ✅ Shared utilities with backend via @shared alias

## 🔗 Integration

- **Backend API**: http://localhost:8080
- **Shared Types**: `@shared` alias points to `../../shared`
- **Authentication**: JWT tokens from backend
- **Real-time**: Supabase subscriptions (future)
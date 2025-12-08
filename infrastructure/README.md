# AREA Infrastructure

Docker, deployment, and infrastructure configuration for the AREA platform.

## 🏗️ Structure

```
infrastructure/
├── docker/           # Docker configurations
├── deployment/       # Deployment scripts
├── monitoring/       # Monitoring setup
└── database/         # Database schemas & migrations
```

## 🐳 Docker Services

### docker-compose.yml
Orchestrates all services:
- `server` (backend): Port 8080
- `client_web` (web): Port 8081
- `client_mobile` (mobile build): Shared volume

### Environment
- Development: docker-compose.yml
- Production: docker-compose.prod.yml (future)

## 🗄️ Database

### Schema
Complete database schema with:
- User management
- Service definitions
- Automation (Area) configurations
- Hook execution logs

### Migrations
- Initial schema creation
- Service data seeding
- Version updates

## 📊 Monitoring

- Application logs
- Performance metrics
- Error tracking
- Uptime monitoring
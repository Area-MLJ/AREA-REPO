# AREA Shared Resources

Common resources and utilities shared across backend, web, and mobile clients.

## 🏗️ Structure

```
shared/
├── types/            # TypeScript type definitions
├── constants/        # Application constants
├── utils/            # Shared utility functions
├── schemas/          # Data validation schemas
└── api/              # API client configurations
```

## 📦 Contents

### Types
- Database entity types
- API request/response types
- Common UI component types

### Constants
- Service definitions
- Error codes
- Configuration constants

### Utils
- Date/time utilities
- Validation helpers
- Format functions

### Schemas
- Zod validation schemas
- Database schema documentation

## 📱 Usage

Imported by:
- Backend API for type safety
- Web client for consistent types
- Mobile client for API integration
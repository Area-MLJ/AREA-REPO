# Backend POC Specification

## Overview
This document defines the exact specification for the 3 backend POCs (Next.js, Express, Fastify).
All implementations must follow this spec to ensure fair benchmarking.

---

## Technology Stack (Common to all POCs)

### Required Libraries
- **JWT**: `jsonwebtoken` (same version across all POCs)
- **Password Hashing**: `bcrypt` (same version across all POCs)
- **SQLite**: `better-sqlite3` (same version across all POCs)
- **HTTP Client**: `node-fetch` or native `fetch` (same across all POCs)

### Node.js Version
- Use the same Node.js version for all 3 POCs

---

## Database Schema

### Table: `users`
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `user_pokemons`
```sql
CREATE TABLE user_pokemons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  pokemon_name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## API Endpoints

### 1. POST `/register`
**Description**: Create a new user account

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "user"
}
```

**Validation**:
- Email: valid email format
- Password: no minimum length requirement
- Role: must be either "user" or "admin" (default: "user")

**Success Response** (201):
```json
{
  "message": "User created successfully"
}
```

**Implementation Notes**:
- Password must be hashed using bcrypt before storing
- Email must be unique (handle duplicate error)

---

### 2. POST `/login`
**Description**: Authenticate user and receive JWT token

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Implementation Notes**:
- Verify password using bcrypt.compare()
- JWT payload should include: `{ userId, email, role }`
- JWT should be signed with a secret key
- Token expiration: 24 hours

---

### 3. POST `/users/:id/pokemon`
**Description**: Add a pokemon to a user's collection (requires authentication)

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "pokemonName": "pikachu"
}
```

**Success Response** (200):
```json
{
  "message": "Pokemon added successfully"
}
```

**Implementation Notes**:
- Verify JWT token from Authorization header
- Fetch pokemon from PokeAPI: `https://pokeapi.co/api/v2/pokemon/{pokemonName}`
- Only store the pokemon name in the database
- User can only add pokemon to their own account (verify userId from token matches :id param)

---

### 4. GET `/users/:id/pokemons`
**Description**: Get all pokemons for a user (requires authentication)

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "pokemons": [
    {
      "id": 1,
      "pokemon_name": "pikachu",
      "created_at": "2024-01-01T12:00:00.000Z"
    },
    {
      "id": 2,
      "pokemon_name": "charizard",
      "created_at": "2024-01-01T12:05:00.000Z"
    }
  ]
}
```

**Implementation Notes**:
- Verify JWT token from Authorization header
- User can only view their own pokemons (verify userId from token matches :id param)

---

## Error Handling

All POCs should handle these errors consistently:

### Common Error Response Format
```json
{
  "error": "Error message description"
}
```

### Error Cases to Handle
- **400 Bad Request**: Invalid input data, validation errors
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: User trying to access another user's resources
- **404 Not Found**: Pokemon not found on PokeAPI, user not found
- **409 Conflict**: Email already exists during registration
- **500 Internal Server Error**: Database errors, unexpected errors

---

## Authentication Flow

1. User registers via POST `/register`
2. Password is hashed with bcrypt and stored
3. User logs in via POST `/login`
4. Server returns JWT token
5. Client includes token in Authorization header for protected routes
6. Server verifies token and extracts userId for authorization

---

## External API

### PokeAPI
- Base URL: `https://pokeapi.co/api/v2`
- Endpoint: `/pokemon/{name or id}`
- Only the pokemon name needs to be stored
- Handle cases where pokemon doesn't exist (404 from PokeAPI)

---

## Project Structure (for each POC)

```
<framework>-poc/
├── package.json
├── .env (for JWT_SECRET)
├── database.db (SQLite file, gitignored)
├── src/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── index.js (or server.js)
└── README.md
```

---

## Environment Variables

Each POC should use a `.env` file:
```
JWT_SECRET=your-secret-key-here
PORT=3000
DATABASE_PATH=./database.db
```

---

## Testing Considerations

For fair benchmarking:
1. All POCs must use the same business logic
2. All POCs must use the same database operations
3. All POCs must use the same validation rules
4. Database should be seeded with the same test data before benchmarking
5. Server should be warmed up before running benchmarks

---

## Benchmark Scenario

The main benchmark scenario will test:
1. **Register** a new user
2. **Login** to get JWT token
3. **Add pokemon** to user (with authentication) - this will be the primary benchmark target
4. **Get pokemons** for user (with authentication)

The focus will be on measuring the performance of the authenticated pokemon addition flow, as it combines:
- JWT verification
- External API call (PokeAPI)
- Database write operation

import 'dotenv/config';
import Fastify from 'fastify';
import jwt from 'jsonwebtoken';
import db from './lib/db.js';
import { hashPassword, verifyPassword, generateToken } from './lib/auth.js';
import { getPokemon } from './lib/pokemon.js';

const fastify = Fastify({ logger: false });
const PORT = process.env.PORT || 5000;

fastify.post('/api/register', async (request, reply) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return reply.code(400).send({ error: 'Missing email or password' });
    }

    const hash = await hashPassword(password);
    const stmt = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
    stmt.run(email, hash);

    return reply.code(201).send({ message: 'User registered' });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return reply.code(409).send({ error: 'Email already exists' });
    }
    // eslint-disable-next-line no-console
    console.error('Register error (fastify):', err);
    return reply.code(500).send({ error: 'Internal server error' });
  }
});

fastify.post('/api/login', async (request, reply) => {
  const { email, password } = request.body;
  if (!email || !password) {
    return reply.code(400).send({ error: 'Missing email or password' });
  }

  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const user = stmt.get(email);
  if (!user) {
    return reply.code(401).send({ error: 'Invalid credentials' });
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return reply.code(401).send({ error: 'Invalid credentials' });
  }

  const token = generateToken({ userId: user.id });
  return reply.send({ token });
});

// Auth preHandler
async function withAuth(request, reply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    request.user = payload;
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
}

fastify.post('/api/users/:id/pokemon', { preHandler: withAuth }, async (request, reply) => {
  const { pokemonName } = request.body;
  const { id } = request.params;

  if (request.user.userId !== Number(id)) {
    return reply.code(403).send({ error: 'user id does not match' });
  }

  const pokemon = await getPokemon(pokemonName);
  const stmt = db.prepare('INSERT INTO user_pokemons (user_id, pokemon_name) VALUES (?, ?)');
  stmt.run(request.user.userId, pokemon);
  return reply.code(201).send({ message: 'Pokemon added' });
});

fastify.get('/api/users/:id/pokemons', { preHandler: withAuth }, async (request, reply) => {
  const { id } = request.params;

  if (request.user.userId !== Number(id)) {
    return reply.code(403).send({ error: 'user id does not match' });
  }

  const stmt = db.prepare('SELECT id, pokemon_name, created_at FROM user_pokemons WHERE user_id = ?');
  const pokemons = stmt.all(request.user.userId);
  return reply.send({ pokemons });
});

fastify.delete('/api/delete', { preHandler: withAuth }, async (request, reply) => {
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  stmt.run(request.user.userId);
  return reply.code(204).send();
});

fastify.listen({ port: PORT, host: '0.0.0.0' }).then(() => {
  // eslint-disable-next-line no-console
  console.log(`Fastify server listening on http://localhost:${PORT}`);
}).catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

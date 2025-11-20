import 'dotenv/config';
import express from 'express';
import { withAuth } from './middleware/auth.js';
import db from './lib/db.js';
import { hashPassword, verifyPassword, generateToken, verifyToken } from './lib/auth.js';
import { getPokemon } from './lib/pokemon.js' 

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// TODO: routes ici
app.post('/api/register', async (req, res) => {
    try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const hash = await hashPassword(password);
    const stmt = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
    stmt.run(email, hash);

    console.log('User registered (express):', { status: 201 });
    return res.status(201).json({ message: 'User registered' });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
        console.log('User error (express):', { status: 409 });
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error('Register error (express):', err);
    console.log('User error (express):', { status: 500 });
    return res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        console.log('User error (express):', { status: 400 });
        return res.status(400).json({ error: 'Missing email or password' });
    }
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email);
    if (!user) {
        console.log('User error (express):', { status: 401 });
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await verifyPassword(password, user.password);
    if (!valid) {
        console.log('User error (express):', { status: 401 });
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken({ userId: user.id });
    console.log('User logged in (express):', { status: 200 });
    res.json({ token });
});
app.post('/api/users/:id/pokemon', withAuth, async (req, res) => {
    const { pokemonName } = req.body;
    const { id } = req.params;

    if (req.user.userId !== Number(id)) {
        console.log('User error (express):', { status: 403 });
        return res.status(403).json({ error: 'user id does not match' });
    }

    const pokemon = await getPokemon(pokemonName);
    const stmt = db.prepare('INSERT INTO user_pokemons (user_id, pokemon_name) VALUES (?, ?)');
    stmt.run(req.user.userId, pokemon);
    console.log('User pokemon added (express):', { status: 201 });
    res.status(201).json({ message: 'Pokemon added' });
});
app.get('/api/users/:id/pokemons', withAuth, async (req, res) => {
    const { id } = req.params;

    if (req.user.userId !== Number(id)) {
        console.log('User error (express):', { status: 403 });
        return res.status(403).json({ error: 'user id does not match' });
    }

    const stmt = db.prepare('SELECT id, pokemon_name, created_at FROM user_pokemons WHERE user_id = ?');
    const pokemons = stmt.all(req.user.userId);
    console.log('User pokemons (express):', { status: 200 });
    res.json({ pokemons });
});
app.delete('/api/delete', withAuth, async (req, res) => {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(req.user.userId);
    console.log('User deleted (express):', { status: 204 });
    res.status(204).send();
 });

app.listen(PORT, () => {
  console.log(`Express server listening on http://localhost:${PORT}`);
});
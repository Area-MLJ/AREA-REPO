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
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
    }
    const hash = await hashPassword(password);
    db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hash]);
    res.status(201).json({ message: 'User registered' });
});
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
    }
    const user = db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await verifyPassword(password, user.password);
    if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken({ userId: user.id });
    res.json({ token });
});
app.post('/api/users/:id/pokemon', withAuth, async (req, res) => {
    const { pokemonName } = req.body;
    const { id } = req.params;

    if (req.user.userId !== Number(id)) {
        return res.status(403).json({ error: 'user id does not match' });
    }

    const pokemon = await getPokemon(pokemonName);
    db.run(
        'INSERT INTO user_pokemons (user_id, pokemon_name) VALUES (?, ?)',
        [req.user.userId, pokemon]
    );
    res.status(201).json({ message: 'Pokemon added' });
});
app.get('/api/users/:id/pokemons', withAuth, async (req, res) => {
    const { id } = req.params;

    if (req.user.userId !== Number(id)) {
        return res.status(403).json({ error: 'user id does not match' });
    }

    const pokemons = db.all(
        'SELECT id, pokemon_name, created_at FROM user_pokemons WHERE user_id = ?',
        [req.user.userId]
    );
    res.json({ pokemons });
});
app.delete('/api/delete', withAuth, async (req, res) => {
    db.run('DELETE FROM users WHERE id = ?', [req.user.userId]);
    res.status(204).send();
 });

app.listen(PORT, () => {
  console.log(`Express server listening on http://localhost:${PORT}`);
});
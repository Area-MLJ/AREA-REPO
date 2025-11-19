import db from '../../../lib/db.js';
import { withAuth } from '../../../middleware/auth.js';
import { verifyPassword } from '../../../lib/auth.js';

async function deletePokemonHandler(request, context, user) {
    try {
    const { email, password} = await request.json();
    
    // Validation basique
    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user || !(await verifyPassword(password, user.password))) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    // delete user in the db
    db.prepare('DELETE FROM users WHERE email = ?').run(email);
    // delete user's pokemons in the db
    db.prepare('DELETE FROM user_pokemons WHERE user_id = ?').run(user.id);
    return Response.json({ message: "user deleted" }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const DELETE = withAuth(deletePokemonHandler);

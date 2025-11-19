import { hashPassword } from '../../../lib/auth.js';
import db from '../../../lib/db.js';

export async function POST(request) {
  try {
    const { email, password, role = 'user' } = await request.json();
    
    // Validation basique
    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    // Hasher le password
    const hashedPassword = await hashPassword(password);
    
    // Insérer dans la DB
    const stmt = db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)');
    stmt.run(email, hashedPassword, role);
    
    return Response.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    // Gérer l'erreur d'email déjà existant
    if (error.message.includes('UNIQUE constraint failed')) {
      return Response.json({ error: 'Email already exists' }, { status: 409 });
    }
    
    console.error('Register error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

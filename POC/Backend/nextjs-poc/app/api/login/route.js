import { verifyPassword, generateToken } from '../../../lib/auth.js';
import db from '../../../lib/db.js';

export async function POST(request) {
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
    
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    return Response.json({ token }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

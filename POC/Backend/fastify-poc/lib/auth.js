import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export { hashPassword, verifyPassword, generateToken, verifyToken };

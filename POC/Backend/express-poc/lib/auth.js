import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Fonction pour hasher
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// Fonction pour vérifier
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Fonction pour générer JWT
function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
}

// Fonction pour vérifier JWT
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

// Exporter
export { hashPassword, verifyPassword, generateToken, verifyToken };
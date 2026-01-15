/**
 * Script pour créer les AREA built-in pour un utilisateur spécifique
 * Usage: tsx scripts/create-builtin-areas.ts <user_id>
 */
import 'dotenv/config';
import { createBuiltinAreasForUser } from '../src/core/services/builtin-area-service';

const userId = process.argv[2];

if (!userId) {
  console.error('Usage: tsx scripts/create-builtin-areas.ts <user_id>');
  process.exit(1);
}

console.log(`Creating builtin areas for user: ${userId}`);

createBuiltinAreasForUser(userId)
  .then(() => {
    console.log('✅ Builtin areas created successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error creating builtin areas:', error);
    process.exit(1);
  });


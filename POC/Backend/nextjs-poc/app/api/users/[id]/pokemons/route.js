import db from '../../../../../lib/db.js';
import { withAuth } from '../../../../../middleware/auth.js';

async function getPokemonsHandler(request, context, user) {
  // 1. récupérer id
  const { id } = await context.params;
  // 2. vérifier user.userId === Number(id)
  if (user.userId !== Number(id)) {
    return Response.json({ error: 'user id does not match' }, { status: 403 });
}
  // 3. query DB
  const pokemons = db
  .prepare('SELECT id, pokemon_name, created_at FROM user_pokemons WHERE user_id = ?')
  .all(user.userId);

return Response.json({ pokemons });
}

export const GET = withAuth(getPokemonsHandler);
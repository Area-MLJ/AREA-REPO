import db from '../../../../../lib/db.js';
import { withAuth } from '../../../../../middleware/auth.js';
import { getPokemon } from '../../../../../lib/pokemon.js';

async function addPokemonHandler(request, context, user) {
  // 1. récupérer id
  const { id } = await context.params;
  // 2. vérifier user.userId === Number(id)
  if (user.userId !== Number(id)) {
    return Response.json({ error: 'user id does not match' }, { status: 403 });
  }
  // 3. lire le body (pokemonName)
  const { pokemonName } = await request.json();
  // 4. vérifier pokemon via getPokemon
  const pokemon = await getPokemon(pokemonName);
  if (!pokemon) {
    return Response.json({ error: 'pokemon not found' }, { status: 404 });
  }
  // 5. insert en DB
  db.prepare('INSERT INTO user_pokemons (user_id, pokemon_name) VALUES (?, ?)').run(user.userId, pokemon);
  // 6. return Response.json(...)
  return Response.json({ message: 'Pokemon added' }, { status: 200 });
}

export const POST = withAuth(addPokemonHandler);
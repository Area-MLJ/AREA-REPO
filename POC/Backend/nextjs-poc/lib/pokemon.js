async function getPokemon(name) {
  // Fetch vers PokeAPI
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  
  // Vérifier si le pokemon existe
  if (!response.ok) {
    throw new Error('Pokemon not found');
  }
  
  const data = await response.json();
  return data.name; 
}

export { getPokemon };
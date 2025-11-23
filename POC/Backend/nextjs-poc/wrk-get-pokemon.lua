-- local token = os.getenv("TOKEN_TEST")
wrk.method = "GET"
wrk.path   = "/api/users/1/pokemons"
wrk.headers = {
  ["Content-Type"]  = "application/json",
  ["Authorization"] = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYmVuY2hAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc2MzkwNzQ3MSwiZXhwIjoxNzYzOTkzODcxfQ.emYtl37p0D9GAmtOmznRUQFHt52Zm5oLKc1K-dwn-cg"
}

-- local body = '{"pokemonName":"pikachu"}'
-- wrk.body = body

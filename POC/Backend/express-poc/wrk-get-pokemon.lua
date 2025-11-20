-- local token = os.getenv("TOKEN_TEST")
wrk.method = "GET"
wrk.path   = "/api/users/8/pokemons"
wrk.headers = {
  ["Content-Type"]  = "application/json",
  ["Authorization"] = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsImlhdCI6MTc2MzY2NjI2NywiZXhwIjoxNzYzNzUyNjY3fQ.lygNHrj4GhvSYZXpn-k59_H3w_jIKzcW1Ie4PRIwOjw"
}

-- local body = '{"pokemonName":"pikachu"}'
-- wrk.body = body

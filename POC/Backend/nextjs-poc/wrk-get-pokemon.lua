-- local token = os.getenv("TOKEN_TEST")
wrk.method = "GET"
wrk.path   = "/api/users/2/pokemons"
wrk.headers = {
  ["Content-Type"]  = "application/json",
  ["Authorization"] = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoiYmVuY2hAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc2MzU4NDc3NCwiZXhwIjoxNzYzNjcxMTc0fQ.rrukc01gwTgegDOsziqn1jzTS1GxdvW4hK5eWQLp_7I"
}

-- local body = '{"pokemonName":"pikachu"}'
-- wrk.body = body

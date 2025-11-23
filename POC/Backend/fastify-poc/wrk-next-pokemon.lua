-- local token = os.getenv("TOKEN_TEST")
wrk.method = "POST"
wrk.path   = "/api/users/2/pokemon"
wrk.headers = {
  ["Content-Type"]  = "application/json",
  ["Authorization"] = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc2MzkwNzU2MywiZXhwIjoxNzYzOTkzOTYzfQ.EF3R2TD9_OiXGq0OBg09gYUrcEzYBhoq6bIMKsKm2z8"
}

local body = '{"pokemonName":"pikachu"}'
wrk.body = body

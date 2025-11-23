-- local token = os.getenv("TOKEN_TEST")
wrk.method = "POST"
wrk.path   = "/api/users/1/pokemon"
wrk.headers = {
  ["Content-Type"]  = "application/json",
  ["Authorization"] = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc2MzkwNzUxMiwiZXhwIjoxNzYzOTkzOTEyfQ._7PXn6_tbwuLqjluVZcLCjtb_gyXntXHkIr_GYUafUE"
}

local body = '{"pokemonName":"pikachu"}'
wrk.body = body

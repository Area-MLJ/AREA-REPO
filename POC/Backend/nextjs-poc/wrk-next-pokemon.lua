-- local token = os.getenv("TOKEN_TEST")
wrk.method = "POST"
wrk.path   = "/api/users/8/pokemon"
wrk.headers = {
  ["Content-Type"]  = "application/json",
  ["Authorization"] = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsImVtYWlsIjoiYmVuY2hAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc2MzY2NjIyNiwiZXhwIjoxNzYzNzUyNjI2fQ.j6NK-dVPGiNuQh_EH5If9fyIYA6li_J-GlnyMKTAjcY"
}

local body = '{"pokemonName":"pikachu"}'
wrk.body = body

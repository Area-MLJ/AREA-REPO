local token = os.getenv("TOKEN_TEST")
wrk.method = "POST"
wrk.path   = "/api/users/1/pokemon"
wrk.headers = {
  ["Content-Type"]  = "application/json",
  ["Authorization"] = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoiY0BnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc2MzU3MTU1NCwiZXhwIjoxNzYzNjU3OTU0fQ.AF45Ro2ch6ET5JncU87nDuitOsCIkFB-BHRKgKnutPk"
}

local body = '{"pokemonName":"pikachu"}'
wrk.body = body

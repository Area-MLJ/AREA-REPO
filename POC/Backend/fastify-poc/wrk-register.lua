wrk.method = "POST"
wrk.path   = "/api/register"
wrk.headers = {
  ["Content-Type"]  = "application/json",
}

local body = '{"email":"bench@example.com","password":"bench","role":"user"}'
wrk.body = body

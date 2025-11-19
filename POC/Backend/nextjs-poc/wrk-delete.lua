-- local token = os.getenv("TOKEN_TEST")
wrk.method = "DELETE"
wrk.path   = "/api/delete"
wrk.headers = {
  ["Content-Type"]  = "application/json",
  ["Authorization"] = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYmVuY2hAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc2MzU4MzM2MywiZXhwIjoxNzYzNjY5NzYzfQ.jJ2h59brcaxMgEJTFKB5JOL5ZWBaIzeowBoBNHhjrTk"
}

local body = '{"email":"bench@example.com","password":"bench","role":"user"}'
wrk.body = body

wrk.method = "POST"
wrk.path   = "/api/login"
wrk.headers = {
  ["Content-Type"]  = "application/json",
}

local body = '{"email":"c@gmail.com", "password":"coucou"}'
wrk.body = body

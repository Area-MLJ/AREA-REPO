import requests
import json
from pathlib import Path
import config

url = "https://id.twitch.tv/oauth2/token"

payload = json.dumps({
    "client_id": config.client_id,
    "client_secret": config.client_secret,
    "grant_type": "authorization_code",
    "code": config.twitch_auth_code,
    "redirect_uri": config.redirect_uri,
})
headers = {
    "Content-Type": "application/json",
}

response = requests.post(url, headers=headers, data=payload)

print("Raw response:")
print(response.text)

data = response.json()
twitch_access_token = data.get("access_token", "")
twitch_refresh_token = data.get("refresh_token", "")

# Réécrit config.py avec les champs existants + tokens Twitch
config_path = Path(__file__).parent / "config.py"

client_id = getattr(config, "client_id", "")
client_secret = getattr(config, "client_secret", "")
redirect_uri = getattr(config, "redirect_uri", "")
twitch_auth_code = getattr(config, "twitch_auth_code", "")

with config_path.open("w", encoding="utf-8") as f:
    if client_id:
        f.write(f"client_id = \"{client_id}\"\n")
    if client_secret:
        f.write(f"client_secret = \"{client_secret}\"\n")
    if redirect_uri:
        f.write(f"redirect_uri = \"{redirect_uri}\"\n")
    if twitch_auth_code:
        f.write(f"twitch_auth_code = \"{twitch_auth_code}\"\n")
    if twitch_access_token:
        f.write(f"twitch_access_token = \"{twitch_access_token}\"\n")
    if twitch_refresh_token:
        f.write(f"twitch_refresh_token = \"{twitch_refresh_token}\"\n")

print("Tokens Twitch enregistrés dans config.py sous les noms 'twitch_access_token' et 'twitch_refresh_token'.")

import requests
import json
from pathlib import Path
import config

url = "https://api.twitch.tv/helix/users"

headers = {
    "Client-Id": config.client_id,
    "Authorization": f"Bearer {config.twitch_access_token}",
}

response = requests.get(url, headers=headers)

print("Raw response:")
print(response.text)

response.raise_for_status()

data = response.json()

user_id = None
if isinstance(data, dict):
    items = data.get("data", [])
    if items:
        user_id = items[0].get("id")

if not user_id:
    raise RuntimeError("Impossible de récupérer user_id depuis la réponse Twitch")

print(f"Twitch user_id trouvé : {user_id}")

# Réécrit config.py avec les champs existants + user_id
config_path = Path(__file__).parent / "config.py"

client_id = getattr(config, "client_id", "")
client_secret = getattr(config, "client_secret", "")
redirect_uri = getattr(config, "redirect_uri", "")
twitch_auth_code = getattr(config, "twitch_auth_code", "")
twitch_access_token = getattr(config, "twitch_access_token", "")
twitch_refresh_token = getattr(config, "twitch_refresh_token", "")

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
    f.write(f"user_id = \"{user_id}\"\n")

print("user_id enregistré dans config.py sous le nom 'user_id'.")

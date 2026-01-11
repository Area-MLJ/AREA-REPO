import webbrowser
import urllib.parse
from pathlib import Path
import config

base_url = "https://id.twitch.tv/oauth2/authorize"

scope = "user:read:follows user:read:email"

params = {
    "client_id": config.client_id,
    "redirect_uri": config.redirect_uri,
    "response_type": "code",
    "scope": scope,
}

url = f"{base_url}?{urllib.parse.urlencode(params)}"

print("Open this URL in your browser:")
print(url)

webbrowser.open(url)

print("Copy the 'code' parameter from the redirected URL (after login) and paste it here:")
twitch_auth_code = input("Code: ").strip()

# Réécrit config.py en ajoutant twitch_auth_code, en gardant les autres valeurs existantes
config_path = Path(__file__).parent / "config.py"

client_id = config.client_id
client_secret = config.client_secret
redirect_uri = config.redirect_uri

with config_path.open("w", encoding="utf-8") as f:
    if client_id:
        f.write(f"client_id = \"{client_id}\"\n")
    if client_secret:
        f.write(f"client_secret = \"{client_secret}\"\n")
    if redirect_uri:
        f.write(f"redirect_uri = \"{redirect_uri}\"\n")
    f.write(f"twitch_auth_code = \"{twitch_auth_code}\"\n")

print("Code Twitch enregistré dans config.py sous le nom 'twitch_auth_code'.")

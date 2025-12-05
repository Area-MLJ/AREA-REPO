import requests
import json
from pathlib import Path
import config

url = "https://accounts.spotify.com/api/token"

payload = {
    "grant_type": "client_credentials",
    "client_id": config.client_id,
    "client_secret": config.client_secret,
}
headers = {
    "Content-Type": "application/x-www-form-urlencoded",
}

response = requests.post(url, headers=headers, data=payload)

print("Raw response:")
print(response.text)

data = response.json()
access_token = data.get("access_token", "")

# Réécrit config.py en gardant les champs existants et en ajoutant access_token
config_path = Path(__file__).parent / "config.py"

# On récupère les valeurs existantes de façon sûre (au cas où certains attributs n'existent pas)
client_id = getattr(config, "client_id", "")
client_secret = getattr(config, "client_secret", "")
redirect_uri = getattr(config, "redirect_uri", "")

with config_path.open("w", encoding="utf-8") as f:
    if client_id:
        f.write(f"client_id = \"{client_id}\"\n")
    if client_secret:
        f.write(f"client_secret = \"{client_secret}\"\n")
    if redirect_uri:
        f.write(f"redirect_uri = \"{redirect_uri}\"\n")
    if access_token:
        f.write(f"access_token = \"{access_token}\"\n")

print("Token Spotify enregistré dans config.py sous le nom 'spotify_access_token'.")

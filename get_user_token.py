import requests
import webbrowser
import urllib.parse
from pathlib import Path
import config

base_url = "https://accounts.spotify.com/authorize"

scope = " ".join([
    "user-read-email",
    "user-read-private",
    "user-follow-read",
    "user-read-playback-state",
    "user-modify-playback-state",
    "playlist-read-private",
    "playlist-modify-public",
])

params = {
    "client_id": config.client_id,
    "response_type": "code",
    "redirect_uri": config.redirect_uri,
    "scope": scope,
    "state": "xyz123",
}

url = f"{base_url}?{urllib.parse.urlencode(params)}"

print("Open this URL in your browser:")
print(url)

webbrowser.open(url)

print("Copy the 'code' parameter from the redirected URL (after login) and paste it here:")
spotify_auth_code = input("Code: ").strip()

# Réécrit config.py en ajoutant spotify_auth_code, en gardant les valeurs existantes
config_path = Path(__file__).parent / "config.py"
with config_path.open("w", encoding="utf-8") as f:
    f.write(f"client_id = \"{config.client_id}\"\n")
    f.write(f"client_secret = \"{config.client_secret}\"\n")
    f.write(f"redirect_uri = \"{config.redirect_uri}\"\n")
    f.write(f"spotify_auth_code = \"{spotify_auth_code}\"\n")

print("Code Spotify enregistré dans config.py sous le nom 'spotify_auth_code'.")

import requests
import json
from pathlib import Path
import config

url = "https://oauth2.googleapis.com/token"

payload = json.dumps({
    "code": config.auth_code,
    "client_id": config.client_id,
    "client_secret": config.client_secret,
    "redirect_uri": config.redirect_uri,
    "grant_type": "authorization_code",
})
headers = {
    "Content-Type": "application/json",
}

response = requests.post(url, headers=headers, data=payload)

print("Raw response:")
print(response.text)

data = response.json()
access_token = data.get("access_token", "")
refresh_token = data.get("refresh_token", "")

# Réécrit config.py avec les valeurs existantes + nouveaux tokens
config_path = Path(__file__).parent / "config.py"
with config_path.open("w", encoding="utf-8") as f:
    f.write(f"client_id=\"{config.client_id}\"\n")
    f.write(f"client_secret=\"{config.client_secret}\"\n")
    f.write(f"redirect_uri=\"{config.redirect_uri}\"\n")
    f.write(f"auth_code=\"{config.auth_code}\"\n")
    if access_token:
        f.write(f"access_token=\"{access_token}\"\n")
    if refresh_token:
        f.write(f"refresh_token=\"{refresh_token}\"\n")

print("Tokens enregistrés dans config.py (access_token et éventuellement refresh_token).")

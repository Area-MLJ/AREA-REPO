import webbrowser
import config
import urllib.parse
from pathlib import Path

base_url = "https://accounts.google.com/o/oauth2/v2/auth"

params = {
    "client_id": config.client_id,
    "redirect_uri": config.redirect_uri,
    "response_type": "code",
    "scope": "https://www.googleapis.com/auth/gmail.readonly",
    "access_type": "offline",
    "prompt": "consent",
}

url = f"{base_url}?{urllib.parse.urlencode(params)}"
print("Open this URL in your browser:")
print(url)

# Ouvre directement dans le navigateur par défaut (optionnel)
webbrowser.open(url)

print("Copy the 'code' parameter from the redirected URL and paste it here:")
auth_code = input("Code: ").strip()

# Réécrit config.py en gardant les valeurs actuelles et en ajoutant auth_code
config_path = Path(__file__).parent / "config.py"
with config_path.open("w", encoding="utf-8") as f:
    f.write(f"client_id=\"{config.client_id}\"\n")
    f.write(f"client_secret=\"{config.client_secret}\"\n")
    f.write(f"redirect_uri=\"{config.redirect_uri}\"\n")
    f.write(f"auth_code=\"{auth_code}\"\n")

print("Code enregistré dans config.py sous le nom 'auth_code'.")
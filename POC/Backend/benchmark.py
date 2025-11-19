import os
import subprocess
import base64
import json
import yaml  # pip install pyyaml
import requests  # pip install requests


def login_and_get_token(base_url: str) -> str:
    """Récupère un token JWT via /login pour l'utilisateur de benchmark déjà enregistré."""
    email = "bench@example.com"
    password = "bench"

    login_resp = requests.post(
        f"{base_url}/api/login",
        json={"email": email, "password": password},
        timeout=5,
    )
    login_resp.raise_for_status()
    data = login_resp.json()
    token = data.get("token")
    if not token:
        raise RuntimeError(f"No token in login response: {data}")
    return token

def decode_jwt_user_id(token: str) -> int:
    """Décode le payload d'un JWT (sans vérification) pour extraire userId."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Invalid JWT format")
        payload_b64 = parts[1]
        # padding base64
        padding = -len(payload_b64) % 4
        if padding:
            payload_b64 += "=" * padding
        payload_json = base64.urlsafe_b64decode(payload_b64).decode("utf-8")
        payload = json.loads(payload_json)
        return int(payload["userId"])
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError(f"Failed to decode userId from token: {exc}") from exc


def update_lua_token(script_path: str, token: str, user_id: int) -> None:
    """Met à jour le header Authorization ET l'id dans le chemin /api/users/<id>/... dans un script Lua."""
    with open(script_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1) Mettre à jour le header Authorization
    prefix = '["Authorization"] = "Bearer '
    if prefix not in content:
        raise RuntimeError(f"Authorization header not found in {script_path}")

    # Découpe sur le prefix
    before, rest = content.split(prefix, 1)
    # rest ressemble à 'OLDTOKEN"...'
    after_quote_index = rest.find('"')
    if after_quote_index == -1:
        raise RuntimeError(f"Invalid Authorization line in {script_path}")

    new_rest = token + rest[after_quote_index:]
    content = before + prefix + new_rest

    # 2) Mettre à jour l'id dans le chemin /api/users/<id>/...
    path_prefix = 'wrk.path   = "/api/users/'
    if path_prefix in content:
        before_path, rest_path = content.split(path_prefix, 1)
        # rest_path ressemble à '<oldId>/pokemon"...' ou '<oldId>/pokemons"...'
        slash_index = rest_path.find("/")
        if slash_index == -1:
            raise RuntimeError(f"Invalid wrk.path line in {script_path}")
        new_rest_path = f"{user_id}" + rest_path[slash_index:]
        content = before_path + path_prefix + new_rest_path

    with open(script_path, "w", encoding="utf-8") as f:
        f.write(content)


def run_wrk(base_url: str, script_path: str) -> str:
    cmd = ["wrk", "-t4", "-c64", "-d10s", "-s", script_path, base_url]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout


def main():
    # 1. Charger le fichier YAML
    with open("benchmark_config.yaml", "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)

    for poc in config["pocs"]:
        name = poc["name"]
        base_url = poc["base_url"]

        print(f"\n##### POC: {name} #####")

        token = None
        user_id = None

        for scenario in poc["scripts"]:
            script_name = scenario["name"]
            script_path = scenario["path"]
            needs_auth = scenario.get("auth", False)

            print(f"\n=== {name} / {script_name} ===")

            if needs_auth:
                # Récupère un token frais pour l'utilisateur de bench si nécessaire
                if token is None:
                    token = login_and_get_token(base_url)
                    user_id = decode_jwt_user_id(token)
                # Met à jour le script Lua avec ce nouveau token et user_id
                update_lua_token(script_path, token, user_id)

            output = run_wrk(base_url, script_path)
            print(output)  # plus tard: parser et résumer
            print(f"[SUCCESS] token : {token} (userId={user_id})")

if __name__ == "__main__":
    main()
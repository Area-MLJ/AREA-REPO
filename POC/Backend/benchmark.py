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


def parse_wrk_output(output: str) -> dict:
    """Extrait la latence moyenne (en ms) et le Requests/sec de la sortie wrk."""
    latency_avg_ms = None
    rps = None

    for line in output.splitlines():
        stripped = line.strip()

        # Ligne de latence moyenne, ex:
        # "Latency   700.36ms   97.00ms 829.95ms   94.32%"
        if stripped.startswith("Latency"):
            parts = stripped.split()
            # parts[1] contient quelque chose comme "700.36ms" ou "0.70s"
            if len(parts) >= 2:
                value = parts[1]
                # séparer numérique et unité
                num_str = "".join(ch for ch in value if (ch.isdigit() or ch == "."))
                unit = "".join(ch for ch in value if ch.isalpha())
                try:
                    num = float(num_str)
                except ValueError:
                    num = None

                if num is not None:
                    # Conversion en ms
                    if unit == "ms" or unit == "":
                        latency_avg_ms = num
                    elif unit == "s":
                        latency_avg_ms = num * 1000.0
                    elif unit == "us":
                        latency_avg_ms = num / 1000.0

        # Ligne Requests/sec, ex:
        # "Requests/sec:     87.76"
        if stripped.startswith("Requests/sec:"):
            parts = stripped.split()
            if len(parts) >= 2:
                try:
                    rps = float(parts[1])
                except ValueError:
                    rps = None

    return {"latency_avg_ms": latency_avg_ms, "rps": rps}


def main():
    # 1. Charger le fichier YAML
    with open("benchmark_config.yaml", "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)

    # results[poc_name][scenario_name] = metrics_dict
    results: dict[str, dict[str, dict]] = {}

    for poc in config["pocs"]:
        name = poc["name"]
        base_url = poc["base_url"]

        print(f"\n##### POC: {name} #####")

        token = None
        user_id = None
        results.setdefault(name, {})

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
            print(output)

            metrics = parse_wrk_output(output)
            results[name][script_name] = metrics
            print(
                f"[METRICS] {name} / {script_name} -> "
                f"latency_avg_ms={metrics['latency_avg_ms']}, rps={metrics['rps']}"
            )

            print(f"[SUCCESS] token : {token} (userId={user_id})")

    # Résumé comparatif par POC
    print("\n===== SUMMARY =====")
    for poc_name, scenarios in results.items():
        print(f"\nPOC: {poc_name}")
        total_rps = 0.0
        total_latency = 0.0
        count_rps = 0
        count_latency = 0

        for scenario_name, m in scenarios.items():
            lat = m.get("latency_avg_ms")
            rps = m.get("rps")
            print(
                f"  - {scenario_name}: "
                f"latency_avg_ms={lat}, rps={rps}"
            )

            if rps is not None:
                total_rps += rps
                count_rps += 1
            if lat is not None:
                total_latency += lat
                count_latency += 1

        avg_rps = total_rps / count_rps if count_rps else None
        avg_lat = total_latency / count_latency if count_latency else None
        print(
            f"  => AVERAGE: latency_avg_ms={avg_lat}, rps={avg_rps}"
        )


if __name__ == "__main__":
    main()
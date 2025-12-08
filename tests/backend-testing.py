#!/usr/bin/env python3
import subprocess
import time
import requests
import uuid
import signal
import sys
from pathlib import Path

BACKEND_URL = "http://localhost:8080"
REGISTER_ENDPOINT = f"{BACKEND_URL}/api/auth/register"
LOGIN_ENDPOINT = f"{BACKEND_URL}/api/auth/login"

def wait_for_backend(timeout=60):
    """Attend que le backend réponde sur /api/health ou / (on teste /api/auth/login en GET->erreur mais HTTP OK)."""
    start = time.time()
    while time.time() - start < timeout:
        try:
            # On teste un endpoint simple ; même si ça renvoie 405/400 ce n'est pas grave,
            # on vérifie juste qu'il répond HTTP.
            resp = requests.get(BACKEND_URL)
            print(f"Backend HTTP status: {resp.status_code}")
            return True
        except requests.RequestException:
            print("Backend pas encore prêt, nouvelle tentative...")
            time.sleep(2)
    return False

def start_backend():
    """Lance start_backend.sh depuis la racine du projet."""
    tests_dir = Path(__file__).resolve().parent      # /.../area/tests
    root = tests_dir.parent                          # /.../area
    script = root / "start_backend.sh"

    if not script.exists():
        print(f"Script {script} introuvable")
        sys.exit(1)

    print(f"Lancement de {script} depuis {root}")

    proc = subprocess.Popen(
        ["bash", str(script)],
        cwd=str(root),              # ICI : on se place à la racine
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    return proc

def stop_backend(proc):
    """Arrête le processus de start_backend.sh proprement."""
    if proc and proc.poll() is None:
        print("Arrêt du backend...")
        proc.send_signal(signal.SIGINT)
        try:
            proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            proc.kill()

def test_register_and_login():
    # email unique pour éviter 'User already exists'
    unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    password = "password123"
    display_name = "Test User"

    print("\n=== Test REGISTER ===")
    reg_payload = {
        "email": unique_email,
        "password": password,
        "displayName": display_name,
    }
    r = requests.post(REGISTER_ENDPOINT, json=reg_payload)
    print("Register status:", r.status_code)
    print("Register body:", r.text)
    r.raise_for_status()

    print("\n=== Test LOGIN ===")
    login_payload = {
        "email": unique_email,
        "password": password,
    }
    r2 = requests.post(LOGIN_ENDPOINT, json=login_payload)
    print("Login status:", r2.status_code)
    print("Login body:", r2.text)
    r2.raise_for_status()

    print("\nTests register + login OK")

def main():
    backend_proc = None
    try:
        backend_proc = start_backend()
        print("Backend en démarrage, attente de disponibilité...")
        if not wait_for_backend(timeout=120):
            print("Backend non joignable après timeout")
            sys.exit(1)

        test_register_and_login()

    except KeyboardInterrupt:
        print("Interruption par l'utilisateur.")
    finally:
        stop_backend(backend_proc)

if __name__ == "__main__":
    main()
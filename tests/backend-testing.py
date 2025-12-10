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
    email = TEST_EMAIL
    password = TEST_PASSWORD
    display_name = TEST_DISPLAY_NAME

    print("\n=== Test REGISTER ===")
    reg_payload = {
        "email": email,
        "password": password,
        "displayName": display_name,
    }
    r = requests.post(REGISTER_ENDPOINT, json=reg_payload)
    print("Register status:", r.status_code)
    print("Register body:", r.text)
    r.raise_for_status()

    print("\n=== Test LOGIN ===")
    login_payload = {
        "email": email,
        "password": password,
    }
    r2 = requests.post(LOGIN_ENDPOINT, json=login_payload)
    print("Login status:", r2.status_code)
    print("Login body:", r2.text)
    r2.raise_for_status()

    print("\nTests register + login OK")

DELETE_USER_ENDPOINT = f"{BACKEND_URL}/api/users/delete"

TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "password123"
TEST_DISPLAY_NAME = "Test User"


def delete_test_user_if_exists():
    """Tente de supprimer le user de test via la route protégée /api/users/delete."""
    print("\n=== Cleanup: DELETE test user if exists ===")

    # 1) Essayer de se log in pour récupérer un token
    login_payload = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
    }
    r = requests.post(LOGIN_ENDPOINT, json=login_payload)
    print("Cleanup login status:", r.status_code)
    print("Cleanup login body:", r.text)

    if r.status_code != 200:
        # Pas de user ou mauvais mot de passe -> rien à supprimer, on sort
        print("No existing user to delete (login failed).")
        return

    try:
        body = r.json()
    except Exception:
        print("Impossible de parser la réponse login en JSON, abandon du cleanup.")
        return

    token = body.get("token")
    if not token:
        print("Pas de token dans la réponse login, abandon du cleanup.")
        return

    # 2) Appeler DELETE /api/users/delete avec le token
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    dr = requests.delete(DELETE_USER_ENDPOINT, headers=headers)
    print("Delete user status:", dr.status_code)
    print("Delete user body:", dr.text)

    if dr.status_code in (200, 404):
        print("Cleanup OK (user deleted ou inexistant).")
    else:
        print("Cleanup: suppression utilisateur a échoué (non bloquant pour le test).")

def main():
    backend_proc = None
    try:
        backend_proc = start_backend()
        print("Backend en démarrage, attente de disponibilité...")
        if not wait_for_backend(timeout=120):
            print("Backend non joignable après timeout")
            sys.exit(1)

        # Supprimer le user de test s'il existe déjà
        delete_test_user_if_exists()

        # Puis faire le scénario register + login
        test_register_and_login()
    except KeyboardInterrupt:
        print("Interruption par l'utilisateur.")
    finally:
        stop_backend(backend_proc)

if __name__ == "__main__":
    main()
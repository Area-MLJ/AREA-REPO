# Instructions de Débogage

## Problème: 0 areas affichées alors qu'il y en a sur le web

### Étapes pour déboguer:

1. **Lancez l'application avec les logs**:
   ```bash
   flutter run --verbose | tee debug.log
   ```

2. **Recherchez dans les logs**:
   - `🔐 checkAuthStatus` - Vérifie si le token existe
   - `📡 API: GET /me/areas` - Vérifie si l'appel API est fait
   - `🔑 Token exists` - Vérifie si le token est présent
   - `📥 Response status` - Vérifie le code de réponse
   - `❌ Error` - Vérifie les erreurs

3. **Vérifiez que vous êtes connecté**:
   - Après le login, vérifiez dans les logs: `✅ Token found`
   - Le token devrait être sauvegardé dans SharedPreferences

4. **Testez manuellement l'API**:
   Dans la console web (F12), récupérez votre token:
   ```javascript
   localStorage.getItem('area_access_token')
   ```
   
   Puis testez:
   ```bash
   curl -H "Authorization: Bearer VOTRE_TOKEN" http://10.74.253.210:8080/api/me/areas
   ```

### Causes possibles:

1. ❌ **Pas connecté sur mobile**: Vous devez vous connecter sur l'app mobile avec le même compte
2. ❌ **Token expiré**: Le token a peut-être expiré
3. ❌ **Comptes différents**: Compte web ≠ compte mobile
4. ❌ **Erreur réseau**: L'app mobile ne peut pas joindre le backend
5. ❌ **Parsing error**: Erreur lors de la conversion JSON → Area

### Solution rapide:

1. Sur l'application mobile, **déconnectez-vous** (si connecté)
2. **Reconnectez-vous** avec les mêmes identifiants que sur le web
3. Vérifiez les logs pour voir la réponse de `/me/areas`

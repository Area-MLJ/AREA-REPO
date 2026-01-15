# Configuration Réseau Mobile

## Problème
Le mobile utilisait `localhost:8080` qui ne fonctionne pas depuis un appareil mobile car `localhost` pointe vers l'appareil lui-même, pas vers votre ordinateur.

## Solution
Configuration centralisée de l'URL de l'API dans `lib/config/api_config.dart`

## Configuration selon votre appareil

### 📱 Appareil Physique
```dart
static const String host = '10.74.253.210'; // IP de votre ordinateur
```

Pour trouver votre IP :
```bash
./get-ip.sh
```

### 🖥️ Émulateur Android
```dart
static const String host = '10.0.2.2'; // IP spéciale pour l'émulateur
```

### 🍎 Simulateur iOS
```dart
static const String host = 'localhost'; // localhost fonctionne sur iOS
```

## Vérification

1. **Vérifier que le backend écoute sur toutes les interfaces** :
   ```bash
   ss -tlnp | grep 8080
   # Doit afficher: 0.0.0.0:8080 (pas 127.0.0.1:8080)
   ```

2. **Tester l'accès depuis l'IP** :
   ```bash
   curl http://10.74.253.210:8080/about.json
   ```

3. **Vérifier le firewall** (si nécessaire) :
   ```bash
   sudo ufw allow 8080
   ```

## Fichiers modifiés

- ✅ `lib/config/api_config.dart` - Nouvelle configuration centralisée
- ✅ `lib/services/api_service.dart` - Utilise maintenant ApiConfig
- ✅ `README.md` - Instructions de configuration ajoutées
- ✅ `get-ip.sh` - Script pour détecter votre IP automatiquement

## Test

Après avoir mis à jour `lib/config/api_config.dart` avec votre IP :

```bash
flutter run
```

L'application devrait maintenant charger toutes les données du backend correctement.

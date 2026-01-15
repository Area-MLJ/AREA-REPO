# Fix: Type 'Null' is not a subtype of type 'String'

## Problème
Erreur lors du parsing des données JSON du backend:
```
type 'Null' is not a subtype of type 'String'
```

## Cause
Les modèles Dart utilisaient des champs non-nullable (`String`) mais le backend pouvait retourner `null` pour certains champs. Dart est strict sur les types et refuse de convertir `null` en `String`.

## Solution
Modification de tous les `fromJson` pour gérer les valeurs null de façon sécurisée :

### Avant (❌ cassé)
```dart
factory Area.fromJson(Map<String, dynamic> json) {
  return Area(
    id: json['id'],  // ❌ Crash si null
    userId: json['user_id'],  // ❌ Crash si null
    // ...
  );
}
```

### Après (✅ corrigé)
```dart
factory Area.fromJson(Map<String, dynamic> json) {
  try {
    return Area(
      id: json['id'] as String? ?? '',  // ✅ Valeur par défaut
      userId: json['user_id'] as String? ?? '',  // ✅ Valeur par défaut
      name: json['name'] as String?,  // ✅ Nullable ok
      // ...
    );
  } catch (e) {
    print('❌ Error parsing Area: $e');
    print('📦 JSON data: $json');
    rethrow;
  }
}
```

## Modifications apportées

### Modèles corrigés :
1. ✅ `lib/models/area.dart`
   - `Area.fromJson()`
   - `AreaAction.fromJson()`
   - `AreaReaction.fromJson()`

2. ✅ `lib/models/user.dart`
   - `User.fromJson()`

3. ✅ `lib/models/service.dart`
   - `Service.fromJson()`
   - `ServiceAction.fromJson()`
   - `ServiceReaction.fromJson()`
   - `UserService.fromJson()`

### Améliorations :
- ✅ Cast explicite avec `as String?` pour éviter les erreurs de type
- ✅ Opérateur `??` pour fournir des valeurs par défaut
- ✅ Gestion des `null` pour les dates avec fallback sur `DateTime.now()`
- ✅ Bloc `try-catch` avec logs pour faciliter le débogage
- ✅ Affichage du JSON problématique en cas d'erreur

## Test

```bash
cd frontend/mobile
flutter run
```

L'erreur "type 'Null' is not a subtype of type 'String'" devrait être résolue.

Les logs montreront maintenant clairement quel champ pose problème si une erreur survient :
```
❌ Error parsing Area from JSON: ...
📦 JSON data: {...}
```

## Note importante

Si vous voyez encore l'erreur, regardez les logs pour identifier le champ exact qui pose problème. Les messages d'erreur montrent maintenant :
- Le type de modèle concerné (Area, User, Service, etc.)
- Les données JSON reçues
- L'erreur spécifique

Cela permettra de corriger rapidement le champ problématique.

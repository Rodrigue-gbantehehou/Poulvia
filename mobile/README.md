# Application mobile Flutter — Poulvia 🐔📱

Application mobile native moderne pour la gestion d'exploitations avicoles en Afrique de l'Ouest (Bénin, Côte d'Ivoire, Togo, Sénégal, etc.). Conçue pour fonctionner de manière fluide sur le terrain avec prise en charge hors-ligne, calculs instantanés en plateaux d'œufs de 30 et flux de caisse en FCFA.

---

## 🏗️ Architecture & Stack Technique

- **Framework** : Flutter 3.47+ (Dart 3.13+)
- **State Management** : [Riverpod](https://riverpod.dev) (`flutter_riverpod: ^2.5.1`)
- **Réseau & API** : [Dio](https://pub.dev/packages/dio) avec injection automatique du JWT, header d'exploitation active (`X-Farm-Id`) et clé d'idempotence UUID (`X-Idempotency-Key`).
- **Persistance locale** : `shared_preferences` pour les tokens d'authentification et files de synchronisation.
- **Formattage Métier** :
  - **Plateaux d'œufs (30)** : Calcul automatique `nb // 30` plateaux + reste (ex: 420 œufs = 14 plateaux).
  - **Devise FCFA (XOF)** : Entiers stricts sans centimes (ex: `125 000 FCFA`).
- **Design System** : Thème Émeraude (`#059669`) et Ambre (`#D97706`), Dark Mode automatique, navigation avec barre inférieure opaque anti-défilement et bouton d'action rapide surélevé.

---

## 📁 Structure du Projet

```text
mobile/
├── android/                     # Configuration native Android (Kotlin, Gradle 8+)
├── ios/                         # Configuration native iOS (Swift)
├── web/                         # Support Web (Chrome/Edge pour test rapide)
├── lib/
│   ├── core/
│   │   ├── api/
│   │   │   ├── api_client.dart       # Client Dio singleton + interceptors JWT & Idempotency
│   │   │   └── api_endpoints.dart    # Cartographie des routes Symfony API
│   │   ├── models/
│   │   │   ├── egg_production.dart   # Modèle collecte et ponte d'œufs
│   │   │   ├── farm.dart             # Modèle exploitation avicole
│   │   │   ├── flock.dart            # Modèle bande de volailles (pondeuses / chair)
│   │   │   └── transaction.dart      # Modèle trésorerie & Mobile Money
│   │   ├── theme/
│   │   │   └── app_theme.dart        # Palette émeraude/ambre, styles Material 3 clair/sombre
│   │   └── utils/
│   │       ├── currency_formatter.dart # Formattage FCFA
│   │       └── egg_calculator.dart     # Conversion unités <-> plateaux de 30
│   ├── features/
│   │   ├── dashboard/
│   │   │   ├── dashboard_screen.dart   # Écran d'accueil (KPIs 2x2, raccourcis, bande active)
│   │   │   └── quick_action_sheet.dart # Modale d'enregistrement rapide (1-tap)
│   │   ├── eggs/
│   │   │   └── eggs_screen.dart        # Historique ponte + formulaire avec touches rapides (+30, +60, +150)
│   │   ├── finances/
│   │   │   └── finances_screen.dart    # Flux de caisse & transactions MoMo / Espèces
│   │   ├── flocks/
│   │   │   └── flocks_screen.dart      # Liste des bandes, effectifs et taux de mortalité
│   │   └── navigation/
│   │       └── bottom_nav_scaffold.dart# Scaffold principal, onglets et FAB central ancré
│   └── main.dart                # Point d'entrée avec ProviderScope et MaterialApp
├── test/
│   └── widget_test.dart         # Tests de fumée automatisés
└── pubspec.yaml                 # Dépendances Flutter
```

---

## 🚀 Commandes Utiles

### 1. Analyse statique & Lints
```bash
flutter analyze
```
*(Résultat actuel : 0 erreur, 0 avertissement)*

### 2. Exécution des Tests
```bash
flutter test
```
*(Résultat actuel : All tests passed)*

### 3. Lancer l'application

- **Dans le navigateur Chrome / Edge (test visuel rapide)** :
  ```bash
  flutter run -d chrome
  ```
- **Sur un smartphone Android (branché en USB avec Débogage USB activé)** :
  ```bash
  flutter run
  ```
- **Via Android Studio** :
  Ouvrir le dossier `c:\projets\Poulvia\mobile` dans Android Studio et cliquer sur le bouton vert **Run**.

---

## 🌐 Connexion au Backend API Symfony

L'application communique avec l'API Symfony (`api/`) :
- Sur émulateur Android officiel : `http://10.0.2.2:8000`
- Sur appareil physique : `http://<IP_DU_PC_SUR_LE_WIFI>:8000`
- En Web / Desktop : `http://127.0.0.1:8000`

## Bêta Android et signature release

Les routes contiennent déjà le préfixe `/api`. `API_BASE_URL` doit donc contenir le domaine seul, sans `/api`. En release, l'URL par défaut est `https://api.poulvia.com`.

Depuis le dossier `mobile/`, génère l'APK bêta avec :

```powershell
flutter build apk --release --dart-define=API_BASE_URL=https://api.poulvia.com
```

L'APK sera créé dans `build/app/outputs/flutter-apk/app-release.apk`.

Une clé de signature privée est nécessaire pour installer et distribuer une version release. Crée-la avec `keytool`, conserve-la en lieu sûr et réutilise-la pour les mises à jour. Ne la versionne jamais. Avant le build, définis ces variables d'environnement :

```powershell
$env:POULVIA_UPLOAD_STORE_FILE = "C:\chemin-prive\poulvia-upload.jks"
$env:POULVIA_UPLOAD_STORE_PASSWORD = "mot-de-passe-du-keystore"
$env:POULVIA_UPLOAD_KEY_ALIAS = "poulvia"
$env:POULVIA_UPLOAD_KEY_PASSWORD = "mot-de-passe-de-la-cle"
```

Sans ces quatre variables, les builds debug restent utilisables, mais les tâches `assembleRelease`, `packageRelease` et `bundleRelease` s'arrêtent plutôt que de produire une release non signée.

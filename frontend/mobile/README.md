# AREA Mobile App

A Flutter-based mobile application for the AREA (Action-Reaction Automation) platform.

## Features

- **Authentication**: Login and registration with email/password
- **Areas Management**: View, create, and manage automation areas
- **Services**: Browse available services and their actions/reactions
- **Profile**: User profile management and app information
- **About**: View server and services information

## Architecture

The app follows a clean architecture pattern with:

- **Models**: Data models for User, Area, Service, etc.
- **Providers**: State management using Provider pattern
- **Services**: API communication layer
- **Screens**: UI screens organized by feature

## Getting Started

### Prerequisites

- Flutter SDK (>=2.17.0)
- Dart SDK (>=2.17.0)

### Installation

1. Navigate to the mobile directory:
   ```bash
   cd frontend/mobile
   ```

2. Install dependencies:
   ```bash
   flutter pub get
   ```

3. Run the app:
   ```bash
   flutter run
   ```

### Configuration

Update the API base URL in `lib/services/api_service.dart` to match your backend URL.

## Project Structure

```
lib/
├── main.dart                 # App entry point
├── models/                   # Data models
├── providers/                # State management
├── services/                 # API services
└── screens/                  # UI screens
```

## Dependencies

- `provider`: State management
- `http`: HTTP client for API calls
- `flutter_secure_storage`: Secure token storage
- `shared_preferences`: Local data persistence
- `intl`: Date/time formatting

## Testing

Run tests:
```bash
flutter test
```

## Building

Build APK for Android:
```bash
flutter build apk
```

The mobile client builds to `/build/client.apk` which is served by the web client.
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

**IMPORTANT**: Before running the app, you need to configure the API URL based on your setup:

1. Edit `lib/config/api_config.dart`
2. Update the `host` value:
   - For **Android Emulator**: Use `10.0.2.2`
   - For **iOS Simulator**: Use `localhost`
   - For **Physical Device**: Use your computer's IP address (e.g., `10.74.253.210`)
   
   To find your IP address:
   ```bash
   # On Linux/Mac
   ip -4 addr show | grep inet
   # or
   ifconfig | grep inet
   ```

Example configuration in `lib/config/api_config.dart`:
```dart
class ApiConfig {
  static const String host = '10.74.253.210'; // Your computer's IP
  static const String port = '8080';
  
  static String get baseUrl => 'http://$host:$port/api';
  static String get aboutBaseUrl => 'http://$host:$port';
}
```

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
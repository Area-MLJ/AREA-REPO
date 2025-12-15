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
- Android SDK (for Android builds)
- Xcode (for iOS builds on macOS)

### Quick Start Scripts

The project includes convenient shell scripts (located in the AREA root directory):

#### Development Mode
```bash
# From AREA root directory
cd /path/to/AREA

# Run on default device
./start_mobile.sh

# Run on specific platform
./start_mobile.sh web      # Run in Chrome (port 8082)
./start_mobile.sh android  # Run on Android device/emulator
./start_mobile.sh ios      # Run on iOS device/simulator (macOS only)
```

#### Building
```bash
# From AREA root directory
cd /path/to/AREA

# Build Android APK (default)
./build_mobile.sh

# Build for specific platform
./build_mobile.sh android  # Build APK
./build_mobile.sh web      # Build web version
./build_mobile.sh ios      # Build iOS app (macOS only)
```

#### Testing
```bash
# From AREA root directory
cd /path/to/AREA

# Run tests and code quality checks
./test_mobile.sh
```

### Manual Installation

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

## Available Scripts

Scripts are located in the AREA root directory:

- **`./start_mobile.sh [platform]`** - Start development server
  - Runs the app in development mode with hot reload
  - Optional platform: `web`, `android`, `ios`
  - Web runs on port 8082
  
- **`./build_mobile.sh [platform]`** - Build production app
  - Creates optimized production build
  - Default platform: `android`
  - Outputs APK to: `frontend/mobile/build/app/outputs/flutter-apk/app-release.apk`
  
- **`./test_mobile.sh`** - Run tests and checks
  - Runs unit tests
  - Runs analyzer for code quality
  - Checks code formatting

## Testing

Run tests manually:
```bash
flutter test
```

## Building

Build APK for Android:
```bash
flutter build apk --release
```

Build for web:
```bash
flutter build web --release
```

The mobile client builds to `/build/client.apk` which is served by the web client.
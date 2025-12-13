# AREA Mobile Client

Mobile application for Android/iOS providing native access to AREA platform.

## 🎯 Purpose

Mobile app allowing users to:
- Create automations on-the-go
- Receive push notifications
- Quick service connections
- Monitor automation status

## 🏗️ Architecture

```
frontend/mobile/
├── src/
│   ├── components/    # Reusable components
│   ├── screens/       # App screens
│   ├── navigation/    # Navigation setup
│   ├── services/      # API services
│   └── utils/         # Utilities
├── android/          # Android-specific code
├── ios/              # iOS-specific code (if applicable)
└── build/            # Build outputs (APK, etc.)
```

## 📱 Platforms

- Android (primary target)
- iOS (future consideration)

## 🔧 Build

The mobile client builds to `/build/client.apk` which is served by the web client at http://localhost:8081/client.apk as required by the project specifications.
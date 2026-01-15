class ApiConfig {
  // Change this to your computer's IP address when testing on physical device
  // Use 10.0.2.2 for Android emulator
  // Use localhost for iOS simulator
  // Use your machine's IP (e.g., 10.74.253.210) for physical devices
  static const String host = '10.74.253.210'; // Update this with your machine's IP
  static const String port = '8080';
  
  static String get baseUrl => 'http://$host:$port/api';
  static String get aboutBaseUrl => 'http://$host:$port';
}

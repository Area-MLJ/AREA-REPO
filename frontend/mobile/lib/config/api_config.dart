class ApiConfig {
  // API Configuration
  // For production, use environment variables or build configurations
  // For development, update the host based on your setup:
  // - Android Emulator: Use '10.0.2.2'
  // - iOS Simulator: Use 'localhost'  
  // - Physical Device: Use your computer's IP address
  
  // To get your IP: Run ./get-ip.sh or use `ip addr show` (Linux) / `ifconfig` (Mac)
  static const String host = String.fromEnvironment('API_HOST', defaultValue: 'localhost');
  static const String port = String.fromEnvironment('API_PORT', defaultValue: '8080');
  
  static String get baseUrl => 'http://$host:$port/api';
  static String get aboutBaseUrl => 'http://$host:$port';
}

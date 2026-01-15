import 'dart:convert';
import 'package:http/http.dart' as http;

void main() async {
  // Test direct de l'API
  final host = '10.74.253.210';
  final port = '8080';
  
  print('🔍 Testing API connection...');
  print('URL: http://$host:$port/api');
  
  // Test 1: Login
  print('\n1️⃣ Testing login...');
  try {
    final loginResponse = await http.post(
      Uri.parse('http://$host:$port/api/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'email': 'test@example.com',
        'password': 'password123',
      }),
    );
    
    print('Status: ${loginResponse.statusCode}');
    print('Response: ${loginResponse.body}');
    
    if (loginResponse.statusCode == 200) {
      final data = json.decode(loginResponse.body);
      final token = data['access_token'];
      print('✅ Token: ${token.substring(0, 20)}...');
      
      // Test 2: Get areas
      print('\n2️⃣ Testing get areas...');
      final areasResponse = await http.get(
        Uri.parse('http://$host:$port/api/me/areas'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      
      print('Status: ${areasResponse.statusCode}');
      print('Response: ${areasResponse.body}');
      
      if (areasResponse.statusCode == 200) {
        final areas = json.decode(areasResponse.body);
        print('✅ Found ${areas.length} areas');
      }
    }
  } catch (e) {
    print('❌ Error: $e');
  }
}

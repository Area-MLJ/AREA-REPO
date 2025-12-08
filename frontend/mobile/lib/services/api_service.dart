import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../models/area.dart';
import '../models/service.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:8080/api';

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  static Future<void> removeToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  static Future<Map<String, String>> getHeaders({bool includeAuth = true}) async {
    Map<String, String> headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      final token = await getToken();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  // Auth endpoints
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: await getHeaders(includeAuth: false),
      body: json.encode({
        'email': email,
        'password': password,
      }),
    );

    final data = json.decode(response.body);
    
    if (response.statusCode == 200) {
      await saveToken(data['token']);
      return data;
    } else {
      throw Exception(data['error'] ?? 'Login failed');
    }
  }

  static Future<Map<String, dynamic>> register(
    String email,
    String password, {
    String? displayName,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: await getHeaders(includeAuth: false),
      body: json.encode({
        'email': email,
        'password': password,
        'displayName': displayName,
      }),
    );

    final data = json.decode(response.body);
    
    if (response.statusCode == 201) {
      await saveToken(data['token']);
      return data;
    } else {
      throw Exception(data['error'] ?? 'Registration failed');
    }
  }

  static Future<void> logout() async {
    await removeToken();
  }

  // Areas endpoints
  static Future<List<Area>> getAreas() async {
    final response = await http.get(
      Uri.parse('$baseUrl/areas'),
      headers: await getHeaders(),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final List<dynamic> areasJson = data['areas'];
      return areasJson.map((json) => Area.fromJson(json)).toList();
    } else {
      throw Exception('Failed to fetch areas');
    }
  }

  static Future<Area> createArea(String name, {String? description, bool enabled = true}) async {
    final response = await http.post(
      Uri.parse('$baseUrl/areas'),
      headers: await getHeaders(),
      body: json.encode({
        'name': name,
        'description': description,
        'enabled': enabled,
      }),
    );

    if (response.statusCode == 201) {
      final data = json.decode(response.body);
      return Area.fromJson(data['area']);
    } else {
      final data = json.decode(response.body);
      throw Exception(data['error'] ?? 'Failed to create area');
    }
  }

  // Services endpoints
  static Future<List<Service>> getServices() async {
    final response = await http.get(
      Uri.parse('$baseUrl/services'),
      headers: await getHeaders(),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final List<dynamic> servicesJson = data['services'];
      return servicesJson.map((json) => Service.fromJson(json)).toList();
    } else {
      throw Exception('Failed to fetch services');
    }
  }

  // About endpoint (public)
  static Future<Map<String, dynamic>> getAbout() async {
    final response = await http.get(
      Uri.parse('$baseUrl/about.json'),
      headers: await getHeaders(includeAuth: false),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to fetch about information');
    }
  }
}
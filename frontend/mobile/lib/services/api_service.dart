import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../models/area.dart';
import '../models/service.dart';

class ApiService {
  // Base URL can be configured via environment or build config
  // For now, using localhost for dev, can be changed for production
  static const String baseUrl = 'http://localhost:8080/api';
  static const String aboutBaseUrl = 'http://localhost:8080';

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_access_token');
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_access_token', token);
  }

  static Future<void> removeToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_access_token');
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

  // Helper method for requests with retry logic
  static Future<http.Response> _requestWithRetry(
    Future<http.Response> Function() requestFn, {
    int maxRetries = 3,
    int baseDelayMs = 1000,
  }) async {
    Exception? lastError;
    
    for (int attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        final response = await requestFn();
        
        // Si succès, retourner immédiatement
        if (response.statusCode >= 200 && response.statusCode < 300) {
          return response;
        }
        
        // Si erreur 401/403, ne pas retry
        if (response.statusCode == 401 || response.statusCode == 403) {
          return response;
        }
        
        // Si erreur 5xx, retry
        if (response.statusCode >= 500 && attempt < maxRetries) {
          lastError = Exception('HTTP ${response.statusCode}');
          await Future.delayed(Duration(milliseconds: baseDelayMs * (1 << attempt)));
          continue;
        }
        
        // Autres erreurs, ne pas retry
        return response;
      } catch (e) {
        lastError = e is Exception ? e : Exception(e.toString());
        
        // Retry seulement pour les erreurs réseau
        if (attempt < maxRetries && (e is SocketException || e is TimeoutException || e is http.ClientException)) {
          await Future.delayed(Duration(milliseconds: baseDelayMs * (1 << attempt)));
          continue;
        }
        
        // Dernière tentative
        if (attempt == maxRetries) {
          rethrow;
        }
      }
    }
    
    throw lastError ?? Exception('Request failed after retries');
  }

  // Auth endpoints
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _requestWithRetry(
      () => http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: await getHeaders(includeAuth: false),
        body: json.encode({
          'email': email,
          'password': password,
        }),
      ),
    );

    final data = json.decode(response.body) as Map<String, dynamic>;
    
    if (response.statusCode == 200) {
      // Backend returns access_token, not token
      await saveToken(data['access_token'] as String);
      // Map backend format to frontend format
      return {
        'user': data['user'],
        'token': data['access_token'], // Keep for compatibility
        'access_token': data['access_token'],
        'refresh_token': data['refresh_token'],
      };
    } else {
      throw Exception(data['error'] ?? 'Login failed');
    }
  }

  static Future<Map<String, dynamic>> register(
    String email,
    String password, {
    String? displayName,
  }) async {
    final response = await _requestWithRetry(
      () => http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: await getHeaders(includeAuth: false),
        body: json.encode({
          'email': email,
          'password': password,
          'display_name': displayName, // Backend expects display_name
        }),
      ),
    );

    final data = json.decode(response.body) as Map<String, dynamic>;
    
    if (response.statusCode == 201) {
      // Backend returns access_token, not token
      await saveToken(data['access_token'] as String);
      // Map backend format to frontend format
      return {
        'user': data['user'],
        'token': data['access_token'], // Keep for compatibility
        'access_token': data['access_token'],
        'refresh_token': data['refresh_token'],
      };
    } else {
      throw Exception(data['error'] ?? 'Registration failed');
    }
  }

  static Future<void> logout() async {
    await removeToken();
  }

  // Areas endpoints
  static Future<List<Area>> getAreas() async {
    final response = await _requestWithRetry(
      () => http.get(
        Uri.parse('$baseUrl/me/areas'),
        headers: await getHeaders(),
      ),
    );

    if (response.statusCode == 200) {
      // Backend returns array directly, not wrapped
      final List<dynamic> areasJson = json.decode(response.body) as List<dynamic>;
      return areasJson.map((json) => Area.fromJson(json as Map<String, dynamic>)).toList();
    } else {
      final data = json.decode(response.body) as Map<String, dynamic>;
      throw Exception(data['error'] ?? 'Failed to fetch areas');
    }
  }

  static Future<Area> createArea(String name, {String? description, bool enabled = true}) async {
    final response = await _requestWithRetry(
      () => http.post(
        Uri.parse('$baseUrl/me/areas'),
        headers: await getHeaders(),
        body: json.encode({
          'name': name,
          'description': description,
          'enabled': enabled,
        }),
      ),
    );

    if (response.statusCode == 201) {
      // Backend returns area directly, not wrapped
      final data = json.decode(response.body) as Map<String, dynamic>;
      return Area.fromJson(data);
    } else {
      final data = json.decode(response.body) as Map<String, dynamic>;
      throw Exception(data['error'] ?? 'Failed to create area');
    }
  }

  // Services endpoints
  static Future<List<Service>> getServices() async {
    final response = await _requestWithRetry(
      () => http.get(
        Uri.parse('$baseUrl/services'),
        headers: await getHeaders(),
      ),
    );

    if (response.statusCode == 200) {
      // Backend returns array directly, not wrapped
      final List<dynamic> servicesJson = json.decode(response.body) as List<dynamic>;
      return servicesJson.map((json) => Service.fromJson(json as Map<String, dynamic>)).toList();
    } else {
      final data = json.decode(response.body) as Map<String, dynamic>;
      throw Exception(data['error'] ?? 'Failed to fetch services');
    }
  }

  // About endpoint (public) - not under /api
  static Future<Map<String, dynamic>> getAbout() async {
    final response = await http.get(
      Uri.parse('$aboutBaseUrl/about.json'),
      headers: await getHeaders(includeAuth: false),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body) as Map<String, dynamic>;
    } else {
      throw Exception('Failed to fetch about information');
    }
  }
}
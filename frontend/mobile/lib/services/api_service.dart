import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/area.dart';
import '../models/service.dart';
import '../config/api_config.dart';

class ApiService {
  static String get baseUrl => ApiConfig.baseUrl;
  static String get aboutBaseUrl => ApiConfig.aboutBaseUrl;

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
      () async => http.post(
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
      () async => http.post(
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
    if (kDebugMode) {
      print('📡 API: GET /me/areas');
      final token = await getToken();
      print('🔑 Token exists: ${token != null}');
    }
    
    final response = await _requestWithRetry(
      () async => http.get(
        Uri.parse('$baseUrl/me/areas'),
        headers: await getHeaders(),
      ),
    );

    if (kDebugMode) {
      print('📥 Response status: ${response.statusCode}');
      if (response.statusCode == 200) {
        final count = (json.decode(response.body) as List).length;
        print('✅ Parsed $count areas from JSON');
      }
    }

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
      () async => http.post(
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

  static Future<Area> updateArea(String id, {String? name, String? description, bool? enabled}) async {
    final response = await _requestWithRetry(
      () async => http.put(
        Uri.parse('$baseUrl/me/areas/$id'),
        headers: await getHeaders(),
        body: json.encode({
          if (name != null) 'name': name,
          if (description != null) 'description': description,
          if (enabled != null) 'enabled': enabled,
        }),
      ),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body) as Map<String, dynamic>;
      return Area.fromJson(data);
    } else {
      final data = json.decode(response.body) as Map<String, dynamic>;
      throw Exception(data['error'] ?? 'Failed to update area');
    }
  }

  static Future<void> deleteArea(String id) async {
    final response = await _requestWithRetry(
      () async => http.delete(
        Uri.parse('$baseUrl/me/areas/$id'),
        headers: await getHeaders(),
      ),
    );

    if (response.statusCode != 200 && response.statusCode != 204) {
      final data = json.decode(response.body) as Map<String, dynamic>;
      throw Exception(data['error'] ?? 'Failed to delete area');
    }
  }

  // Services endpoints
  static Future<List<Service>> getServices() async {
    final response = await _requestWithRetry(
      () async => http.get(
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

  // User Services endpoints
  static Future<List<UserService>> getUserServices() async {
    final response = await _requestWithRetry(
      () async => http.get(
        Uri.parse('$baseUrl/me/services'),
        headers: await getHeaders(),
      ),
    );

    if (response.statusCode == 200) {
      final List<dynamic> userServicesJson = json.decode(response.body) as List<dynamic>;
      return userServicesJson.map((json) => UserService.fromJson(json as Map<String, dynamic>)).toList();
    } else {
      final data = json.decode(response.body) as Map<String, dynamic>;
      throw Exception(data['error'] ?? 'Failed to fetch user services');
    }
  }

  // Spotify OAuth
  static Future<Map<String, dynamic>> spotifyAuthorize() async {
    final response = await _requestWithRetry(
      () async => http.post(
        Uri.parse('$baseUrl/oauth/spotify/authorize'),
        headers: await getHeaders(),
      ),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = json.decode(response.body) as Map<String, dynamic>;
      return data;
    } else {
      final data = json.decode(response.body) as Map<String, dynamic>;
      throw Exception(data['error'] ?? 'Failed to authorize Spotify');
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
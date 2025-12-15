import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
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
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/services'),
        headers: await getHeaders(),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List<dynamic> servicesJson = data['services'];
        return servicesJson.map((json) => Service.fromJson(json)).toList();
      } else {
        // Return mock data as fallback
        return _getMockServices();
      }
    } catch (e) {
      // Return mock data as fallback on network error
      return _getMockServices();
    }
  }

  static List<Service> _getMockServices() {
    final now = DateTime.now();
    return [
      Service(
        id: '1',
        name: 'Gmail',
        displayName: 'Gmail',
        description: 'Service de messagerie électronique de Google',
        iconUrl: '/icons/gmail.svg',
        category: 'communication',
        createdAt: now,
        isConnected: false,
        actions: [
          ServiceAction(
            id: '1',
            serviceId: '1',
            name: 'new_email_received',
            displayName: 'Nouveau email reçu',
            description: 'Déclenché lorsqu\'un nouvel email est reçu',
            pollingSupported: true,
            webhookSupported: true,
            createdAt: now,
          ),
          ServiceAction(
            id: '2',
            serviceId: '1',
            name: 'email_with_attachment',
            displayName: 'Email avec pièce jointe',
            description: 'Déclenché lorsqu\'un email avec pièce jointe est reçu',
            pollingSupported: true,
            webhookSupported: true,
            createdAt: now,
          ),
        ],
        reactions: [
          ServiceReaction(
            id: '1',
            serviceId: '1',
            name: 'send_email',
            displayName: 'Envoyer un email',
            description: 'Envoie un email',
            createdAt: now,
          ),
          ServiceReaction(
            id: '2',
            serviceId: '1',
            name: 'forward_email',
            displayName: 'Transférer un email',
            description: 'Transfère un email',
            createdAt: now,
          ),
        ],
      ),
      Service(
        id: '2',
        name: 'GitHub',
        displayName: 'GitHub',
        description: 'Plateforme de développement collaboratif',
        iconUrl: '/icons/github.svg',
        category: 'productivity',
        createdAt: now,
        isConnected: true,
        actions: [
          ServiceAction(
            id: '3',
            serviceId: '2',
            name: 'push_to_repository',
            displayName: 'Push sur repository',
            description: 'Déclenché lors d\'un push',
            pollingSupported: false,
            webhookSupported: true,
            createdAt: now,
          ),
          ServiceAction(
            id: '4',
            serviceId: '2',
            name: 'new_issue_created',
            displayName: 'Nouvelle issue créée',
            description: 'Déclenché lors de la création d\'une issue',
            pollingSupported: true,
            webhookSupported: true,
            createdAt: now,
          ),
          ServiceAction(
            id: '5',
            serviceId: '2',
            name: 'pull_request_merged',
            displayName: 'Pull request mergée',
            description: 'Déclenché lors du merge d\'une PR',
            pollingSupported: false,
            webhookSupported: true,
            createdAt: now,
          ),
        ],
        reactions: [
          ServiceReaction(
            id: '3',
            serviceId: '2',
            name: 'create_issue',
            displayName: 'Créer une issue',
            description: 'Crée une nouvelle issue',
            createdAt: now,
          ),
          ServiceReaction(
            id: '4',
            serviceId: '2',
            name: 'comment_pr',
            displayName: 'Commenter une PR',
            description: 'Ajoute un commentaire sur une PR',
            createdAt: now,
          ),
        ],
      ),
      Service(
        id: '3',
        name: 'Discord',
        displayName: 'Discord',
        description: 'Plateforme de communication pour communautés',
        iconUrl: '/icons/discord.svg',
        category: 'social',
        createdAt: now,
        isConnected: false,
        actions: [
          ServiceAction(
            id: '6',
            serviceId: '3',
            name: 'message_received',
            displayName: 'Message reçu',
            description: 'Déclenché lors de la réception d\'un message',
            pollingSupported: false,
            webhookSupported: true,
            createdAt: now,
          ),
          ServiceAction(
            id: '7',
            serviceId: '3',
            name: 'user_joined_server',
            displayName: 'Utilisateur rejoint un serveur',
            description: 'Déclenché quand un utilisateur rejoint',
            pollingSupported: false,
            webhookSupported: true,
            createdAt: now,
          ),
        ],
        reactions: [
          ServiceReaction(
            id: '5',
            serviceId: '3',
            name: 'send_message',
            displayName: 'Envoyer un message',
            description: 'Envoie un message sur Discord',
            createdAt: now,
          ),
          ServiceReaction(
            id: '6',
            serviceId: '3',
            name: 'create_channel',
            displayName: 'Créer un channel',
            description: 'Crée un nouveau channel',
            createdAt: now,
          ),
        ],
      ),
      Service(
        id: '4',
        name: 'GoogleDrive',
        displayName: 'Google Drive',
        description: 'Service de stockage cloud de Google',
        iconUrl: '/icons/gdrive.svg',
        category: 'storage',
        createdAt: now,
        isConnected: false,
        actions: [
          ServiceAction(
            id: '8',
            serviceId: '4',
            name: 'file_added',
            displayName: 'Fichier ajouté',
            description: 'Déclenché quand un fichier est ajouté',
            pollingSupported: true,
            webhookSupported: true,
            createdAt: now,
          ),
          ServiceAction(
            id: '9',
            serviceId: '4',
            name: 'file_modified',
            displayName: 'Fichier modifié',
            description: 'Déclenché quand un fichier est modifié',
            pollingSupported: true,
            webhookSupported: true,
            createdAt: now,
          ),
        ],
        reactions: [
          ServiceReaction(
            id: '7',
            serviceId: '4',
            name: 'create_file',
            displayName: 'Créer un fichier',
            description: 'Crée un nouveau fichier',
            createdAt: now,
          ),
          ServiceReaction(
            id: '8',
            serviceId: '4',
            name: 'share_file',
            displayName: 'Partager un fichier',
            description: 'Partage un fichier',
            createdAt: now,
          ),
        ],
      ),
    ];
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
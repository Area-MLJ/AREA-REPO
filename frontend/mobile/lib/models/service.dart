import 'package:flutter/foundation.dart';
class Service {
  final String id;
  final String name;
  final String? displayName;
  final String? description;
  final String? iconUrl;
  final DateTime createdAt;
  final List<ServiceAction> actions;
  final List<ServiceReaction> reactions;

  Service({
    required this.id,
    required this.name,
    this.displayName,
    this.description,
    this.iconUrl,
    required this.createdAt,
    this.actions = const [],
    this.reactions = const [],
  });

  factory Service.fromJson(Map<String, dynamic> json) {
    try {
      return Service(
        id: json['id'] as String? ?? '',
        name: json['name'] as String? ?? '',
        displayName: json['display_name'] as String? ?? json['name'] as String? ?? '',
        description: json['description'] as String?,
        iconUrl: json['icon_url'] as String?,
        createdAt: json['created_at'] != null
            ? DateTime.parse(json['created_at'] as String)
            : DateTime.now(),
        actions: (json['service_actions'] as List<dynamic>?)
                ?.map((action) => ServiceAction.fromJson(action as Map<String, dynamic>))
                .toList() ??
            [],
        reactions: (json['service_reactions'] as List<dynamic>?)
                ?.map((reaction) => ServiceReaction.fromJson(reaction as Map<String, dynamic>))
                .toList() ??
            [],
      );
    } catch (e) {
      debugPrint('❌ Error parsing Service from JSON: $e');
      debugPrint('📦 JSON data: $json');
      rethrow;
    }
  }
}

class ServiceAction {
  final String id;
  final String serviceId;
  final String name;
  final String? displayName;
  final String? description;
  final bool pollingSupported;
  final bool webhookSupported;
  final DateTime createdAt;
  final Service? service;

  ServiceAction({
    required this.id,
    required this.serviceId,
    required this.name,
    this.displayName,
    this.description,
    required this.pollingSupported,
    required this.webhookSupported,
    required this.createdAt,
    this.service,
  });

  factory ServiceAction.fromJson(Map<String, dynamic> json) {
    try {
      return ServiceAction(
        id: json['id'] as String? ?? '',
        serviceId: json['service_id'] as String? ?? '',
        name: json['name'] as String? ?? '',
        displayName: json['display_name'] as String? ?? json['name'] as String?,
        description: json['description'] as String?,
        pollingSupported: json['polling_supported'] as bool? ?? false,
        webhookSupported: json['webhook_supported'] as bool? ?? false,
        createdAt: json['created_at'] != null
            ? DateTime.parse(json['created_at'] as String)
            : DateTime.now(),
        service: json['services'] != null
            ? Service.fromJson(json['services'] as Map<String, dynamic>)
            : null,
      );
    } catch (e) {
      debugPrint('❌ Error parsing ServiceAction from JSON: $e');
      debugPrint('📦 JSON data: $json');
      rethrow;
    }
  }
}

class ServiceReaction {
  final String id;
  final String serviceId;
  final String name;
  final String? displayName;
  final String? description;
  final DateTime createdAt;
  final Service? service;

  ServiceReaction({
    required this.id,
    required this.serviceId,
    required this.name,
    this.displayName,
    this.description,
    required this.createdAt,
    this.service,
  });

  factory ServiceReaction.fromJson(Map<String, dynamic> json) {
    try {
      return ServiceReaction(
        id: json['id'] as String? ?? '',
        serviceId: json['service_id'] as String? ?? '',
        name: json['name'] as String? ?? '',
        displayName: json['display_name'] as String? ?? json['name'] as String?,
        description: json['description'] as String?,
        createdAt: json['created_at'] != null
            ? DateTime.parse(json['created_at'] as String)
            : DateTime.now(),
        service: json['services'] != null
            ? Service.fromJson(json['services'] as Map<String, dynamic>)
            : null,
      );
    } catch (e) {
      debugPrint('❌ Error parsing ServiceReaction from JSON: $e');
      debugPrint('📦 JSON data: $json');
      rethrow;
    }
  }
}

class UserService {
  final String id;
  final String userId;
  final String serviceId;
  final String? displayName;
  final String? oauthAccountId;
  final DateTime createdAt;

  UserService({
    required this.id,
    required this.userId,
    required this.serviceId,
    this.displayName,
    this.oauthAccountId,
    required this.createdAt,
  });

  factory UserService.fromJson(Map<String, dynamic> json) {
    try {
      return UserService(
        id: json['id'] as String? ?? '',
        userId: json['user_id'] as String? ?? '',
        serviceId: json['service_id'] as String? ?? '',
        displayName: json['display_name'] as String?,
        oauthAccountId: json['oauth_account_id'] as String?,
        createdAt: json['created_at'] != null
            ? DateTime.parse(json['created_at'] as String)
            : DateTime.now(),
      );
    } catch (e) {
      debugPrint('❌ Error parsing UserService from JSON: $e');
      debugPrint('📦 JSON data: $json');
      rethrow;
    }
  }
}
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
    return Service(
      id: json['id'],
      name: json['name'],
      displayName: json['display_name'],
      description: json['description'],
      iconUrl: json['icon_url'],
      createdAt: DateTime.parse(json['created_at']),
      actions: (json['service_actions'] as List<dynamic>?)
              ?.map((action) => ServiceAction.fromJson(action))
              .toList() ??
          [],
      reactions: (json['service_reactions'] as List<dynamic>?)
              ?.map((reaction) => ServiceReaction.fromJson(reaction))
              .toList() ??
          [],
    );
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
    return ServiceAction(
      id: json['id'],
      serviceId: json['service_id'],
      name: json['name'],
      displayName: json['display_name'],
      description: json['description'],
      pollingSupported: json['polling_supported'] ?? false,
      webhookSupported: json['webhook_supported'] ?? false,
      createdAt: DateTime.parse(json['created_at']),
      service: json['services'] != null
          ? Service.fromJson(json['services'])
          : null,
    );
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
    return ServiceReaction(
      id: json['id'],
      serviceId: json['service_id'],
      name: json['name'],
      displayName: json['display_name'],
      description: json['description'],
      createdAt: DateTime.parse(json['created_at']),
      service: json['services'] != null
          ? Service.fromJson(json['services'])
          : null,
    );
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
    return UserService(
      id: json['id'],
      userId: json['user_id'],
      serviceId: json['service_id'],
      displayName: json['display_name'],
      oauthAccountId: json['oauth_account_id'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}
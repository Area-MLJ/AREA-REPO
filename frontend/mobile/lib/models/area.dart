import 'service.dart';

class Area {
  final String id;
  final String userId;
  final String? name;
  final String? description;
  final bool enabled;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<AreaAction> actions;
  final List<AreaReaction> reactions;

  Area({
    required this.id,
    required this.userId,
    this.name,
    this.description,
    required this.enabled,
    required this.createdAt,
    required this.updatedAt,
    this.actions = const [],
    this.reactions = const [],
  });

  factory Area.fromJson(Map<String, dynamic> json) {
    return Area(
      id: json['id'],
      userId: json['user_id'],
      name: json['name'],
      description: json['description'],
      enabled: json['enabled'] ?? false,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
      actions: (json['area_actions'] as List<dynamic>?)
              ?.map((action) => AreaAction.fromJson(action))
              .toList() ??
          [],
      reactions: (json['area_reactions'] as List<dynamic>?)
              ?.map((reaction) => AreaReaction.fromJson(reaction))
              .toList() ??
          [],
    );
  }
}

class AreaAction {
  final String id;
  final String areaId;
  final String serviceActionId;
  final String userServiceId;
  final Map<String, dynamic>? parameters;
  final ServiceAction? serviceAction;
  final UserService? userService;

  AreaAction({
    required this.id,
    required this.areaId,
    required this.serviceActionId,
    required this.userServiceId,
    this.parameters,
    this.serviceAction,
    this.userService,
  });

  factory AreaAction.fromJson(Map<String, dynamic> json) {
    return AreaAction(
      id: json['id'],
      areaId: json['area_id'],
      serviceActionId: json['service_action_id'],
      userServiceId: json['user_service_id'],
      parameters: json['parameters'],
      serviceAction: json['service_actions'] != null
          ? ServiceAction.fromJson(json['service_actions'])
          : null,
      userService: json['user_services'] != null
          ? UserService.fromJson(json['user_services'])
          : null,
    );
  }
}

class AreaReaction {
  final String id;
  final String areaId;
  final String serviceReactionId;
  final String userServiceId;
  final Map<String, dynamic>? parameters;
  final ServiceReaction? serviceReaction;
  final UserService? userService;

  AreaReaction({
    required this.id,
    required this.areaId,
    required this.serviceReactionId,
    required this.userServiceId,
    this.parameters,
    this.serviceReaction,
    this.userService,
  });

  factory AreaReaction.fromJson(Map<String, dynamic> json) {
    return AreaReaction(
      id: json['id'],
      areaId: json['area_id'],
      serviceReactionId: json['service_reaction_id'],
      userServiceId: json['user_service_id'],
      parameters: json['parameters'],
      serviceReaction: json['service_reactions'] != null
          ? ServiceReaction.fromJson(json['service_reactions'])
          : null,
      userService: json['user_services'] != null
          ? UserService.fromJson(json['user_services'])
          : null,
    );
  }
}
import 'service.dart';

class Area {
  final String id;
  final String userId;
  final String? name;
  final String? description;
  final bool enabled;
  final bool isBuiltin;
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
    this.isBuiltin = false,
    required this.createdAt,
    required this.updatedAt,
    this.actions = const [],
    this.reactions = const [],
  });

  factory Area.fromJson(Map<String, dynamic> json) {
    try {
      return Area(
        id: json['id'] as String? ?? '',
        userId: json['user_id'] as String? ?? '',
        name: json['name'] as String?,
        description: json['description'] as String?,
        enabled: json['enabled'] as bool? ?? false,
        isBuiltin: json['is_builtin'] as bool? ?? false,
        createdAt: json['created_at'] != null 
            ? DateTime.parse(json['created_at'] as String)
            : DateTime.now(),
        updatedAt: json['updated_at'] != null
            ? DateTime.parse(json['updated_at'] as String)
            : (json['created_at'] != null 
                ? DateTime.parse(json['created_at'] as String)
                : DateTime.now()),
        actions: (json['area_actions'] as List<dynamic>?)
                ?.map((action) => AreaAction.fromJson(action as Map<String, dynamic>))
                .toList() ??
            [],
        reactions: (json['area_reactions'] as List<dynamic>?)
                ?.map((reaction) => AreaReaction.fromJson(reaction as Map<String, dynamic>))
                .toList() ??
            [],
      );
    } catch (e) {
      print('❌ Error parsing Area from JSON: $e');
      print('📦 JSON data: $json');
      rethrow;
    }
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
    try {
      return AreaAction(
        id: json['id'] as String? ?? '',
        areaId: json['area_id'] as String? ?? '',
        serviceActionId: json['service_action_id'] as String? ?? '',
        userServiceId: json['user_service_id'] as String? ?? '',
        parameters: json['parameters'] as Map<String, dynamic>?,
        serviceAction: json['service_actions'] != null
            ? ServiceAction.fromJson(json['service_actions'] as Map<String, dynamic>)
            : null,
        userService: json['user_services'] != null
            ? UserService.fromJson(json['user_services'] as Map<String, dynamic>)
            : null,
      );
    } catch (e) {
      print('❌ Error parsing AreaAction from JSON: $e');
      print('📦 JSON data: $json');
      rethrow;
    }
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
    try {
      return AreaReaction(
        id: json['id'] as String? ?? '',
        areaId: json['area_id'] as String? ?? '',
        serviceReactionId: json['service_reaction_id'] as String? ?? '',
        userServiceId: json['user_service_id'] as String? ?? '',
        parameters: json['parameters'] as Map<String, dynamic>?,
        serviceReaction: json['service_reactions'] != null
            ? ServiceReaction.fromJson(json['service_reactions'] as Map<String, dynamic>)
            : null,
        userService: json['user_services'] != null
            ? UserService.fromJson(json['user_services'] as Map<String, dynamic>)
            : null,
      );
    } catch (e) {
      print('❌ Error parsing AreaReaction from JSON: $e');
      print('📦 JSON data: $json');
      rethrow;
    }
  }
}
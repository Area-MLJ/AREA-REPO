import 'package:flutter/foundation.dart';
class User {
  final String id;
  final String email;
  final String? displayName;
  final bool isVerified;

  User({
    required this.id,
    required this.email,
    this.displayName,
    required this.isVerified,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    try {
      return User(
        id: json['id'] as String? ?? '',
        email: json['email'] as String? ?? '',
        // Backend returns display_name, map to displayName
        displayName: json['display_name'] as String? ?? json['displayName'] as String?,
        isVerified: json['isVerified'] as bool? ?? json['is_verified'] as bool? ?? false,
      );
    } catch (e) {
      debugPrint('❌ Error parsing User from JSON: $e');
      debugPrint('📦 JSON data: $json');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'displayName': displayName,
      'isVerified': isVerified,
    };
  }
}
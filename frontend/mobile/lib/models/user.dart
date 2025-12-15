class User {
  final String id;
  final String email;
  final String? displayName;
  final bool isVerified;
  final String? createdAt;

  User({
    required this.id,
    required this.email,
    this.displayName,
    required this.isVerified,
    this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      displayName: json['displayName'],
      isVerified: json['isVerified'] ?? false,
      createdAt: json['created_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'displayName': displayName,
      'isVerified': isVerified,
      'created_at': createdAt,
    };
  }
}
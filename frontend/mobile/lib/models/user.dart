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
    return User(
      id: json['id'],
      email: json['email'],
      displayName: json['displayName'],
      isVerified: json['isVerified'] ?? false,
    );
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
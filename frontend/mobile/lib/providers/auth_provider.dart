import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  bool _isLoading = false;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;

  Future<void> checkAuthStatus() async {
    _isLoading = true;
    notifyListeners();

    try {
      final token = await ApiService.getToken();
      if (token != null) {
        // You might want to validate the token with the backend
        // For now, we'll assume the token is valid if it exists
        // In a real app, you'd call a /me endpoint or similar
      }
    } catch (e) {
      _error = e.toString();
      await ApiService.removeToken();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.login(email, password);
      _user = User.fromJson(response['user']);
      _error = null;
    } catch (e) {
      _error = e.toString();
      _user = null;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> register(String email, String password, {String? displayName}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.register(email, password, displayName: displayName);
      _user = User.fromJson(response['user']);
      _error = null;
    } catch (e) {
      _error = e.toString();
      _user = null;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> logout() async {
    await ApiService.logout();
    _user = null;
    _error = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
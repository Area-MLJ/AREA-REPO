import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
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
      print('🔐 checkAuthStatus - Token exists: ${token != null}');
      
      if (token != null) {
        print('✅ Token found, loading user from storage');
        // Load user from SharedPreferences
        final prefs = await SharedPreferences.getInstance();
        final userJson = prefs.getString('area_user');
        
        if (userJson != null) {
          final userData = json.decode(userJson);
          _user = User.fromJson(userData);
          print('✅ User loaded: ${_user?.email}');
        } else {
          print('⚠️  Token exists but no user data found');
          // Token exists but no user - might be invalid, remove it
          await ApiService.removeToken();
          _user = null;
        }
      } else {
        print('❌ No token found');
        _user = null;
      }
    } catch (e) {
      print('❌ Auth check error: $e');
      _error = e.toString();
      await ApiService.removeToken();
      _user = null;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      print('🔐 Logging in: $email');
      final response = await ApiService.login(email, password);
      _user = User.fromJson(response['user']);
      
      // Save user to SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('area_user', json.encode(response['user']));
      print('✅ Login successful, user saved: ${_user?.email}');
      
      _error = null;
    } catch (e) {
      print('❌ Login error: $e');
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
      print('📝 Registering: $email');
      final response = await ApiService.register(email, password, displayName: displayName);
      _user = User.fromJson(response['user']);
      
      // Save user to SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('area_user', json.encode(response['user']));
      print('✅ Registration successful, user saved: ${_user?.email}');
      
      _error = null;
    } catch (e) {
      print('❌ Registration error: $e');
      _error = e.toString();
      _user = null;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> logout() async {
    print('🚪 Logging out');
    await ApiService.logout();
    
    // Remove user from SharedPreferences
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('area_user');
    
    _user = null;
    _error = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
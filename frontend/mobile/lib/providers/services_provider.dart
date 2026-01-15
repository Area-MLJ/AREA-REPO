import 'package:flutter/material.dart';
import '../models/service.dart';
import '../services/api_service.dart';

class ServicesProvider with ChangeNotifier {
  List<Service> _services = [];
  List<UserService> _userServices = [];
  bool _isLoading = false;
  String? _error;
  bool _spotifyLoading = false;

  List<Service> get services => _services;
  List<UserService> get userServices => _userServices;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get spotifyLoading => _spotifyLoading;

  Service? get spotifyService {
    try {
      return _services.firstWhere((s) => s.name == 'spotify');
    } catch (e) {
      return null;
    }
  }

  UserService? get spotifyUserService {
    final spotify = spotifyService;
    if (spotify == null) return null;
    try {
      return _userServices.firstWhere((us) => us.serviceId == spotify.id);
    } catch (e) {
      return null;
    }
  }

  Future<void> fetchServices() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final results = await Future.wait([
        ApiService.getServices(),
        ApiService.getUserServices(),
      ]);
      
      _services = results[0] as List<Service>;
      _userServices = results[1] as List<UserService>;
      _error = null;
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> handleConnectSpotify() async {
    _spotifyLoading = true;
    notifyListeners();

    try {
      final result = await ApiService.spotifyAuthorize();
      if (result['url'] != null) {
        return;
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _spotifyLoading = false;
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  void clear() {
    _services = [];
    _userServices = [];
    _error = null;
    notifyListeners();
  }
}
import 'package:flutter/material.dart';
import '../models/service.dart';
import '../services/api_service.dart';

class ServicesProvider with ChangeNotifier {
  List<Service> _services = [];
  bool _isLoading = false;
  String? _error;

  List<Service> get services => _services;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchServices() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _services = await ApiService.getServices();
      _error = null;
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  void clear() {
    _services = [];
    _error = null;
    notifyListeners();
  }
}
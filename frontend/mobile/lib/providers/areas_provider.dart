import 'package:flutter/material.dart';
import '../models/area.dart';
import '../services/api_service.dart';

class AreasProvider with ChangeNotifier {
  List<Area> _areas = [];
  bool _isLoading = false;
  String? _error;

  List<Area> get areas => _areas;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchAreas() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _areas = await ApiService.getAreas();
      _error = null;
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> createArea(String name, {String? description, bool enabled = true}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final newArea = await ApiService.createArea(name, description: description, enabled: enabled);
      _areas.insert(0, newArea);
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
    _areas = [];
    _error = null;
    notifyListeners();
  }
}
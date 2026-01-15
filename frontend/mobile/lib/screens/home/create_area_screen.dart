import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/areas_provider.dart';
import '../../providers/services_provider.dart';
import '../../models/service.dart';
import '../../data/mock_services.dart';

class CreateAreaScreen extends StatefulWidget {
  @override
  _CreateAreaScreenState createState() => _CreateAreaScreenState();
}

class _CreateAreaScreenState extends State<CreateAreaScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  bool _enabled = true;
  
  int _currentStep = 0;
  String? _selectedActionServiceId;
  String? _selectedActionId;
  String? _selectedReactionServiceId;
  String? _selectedReactionId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ServicesProvider>(context, listen: false).fetchServices();
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  void _createArea() async {
    if (!_formKey.currentState!.validate()) return;

    final areasProvider = Provider.of<AreasProvider>(context, listen: false);
    await areasProvider.createArea(
      _nameController.text,
      description: _descriptionController.text.isEmpty ? null : _descriptionController.text,
      enabled: _enabled,
    );

    if (areasProvider.error == null) {
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('AREA créée avec succès !'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  void _nextStep() {
    if (_currentStep == 0) {
      if (!_formKey.currentState!.validate()) return;
    }
    
    setState(() {
      if (_currentStep < 2) {
        _currentStep++;
      }
    });
  }

  void _previousStep() {
    setState(() {
      if (_currentStep > 0) {
        _currentStep--;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Créer une AREA'),
        backgroundColor: Color(0xff0a4a0e),
        foregroundColor: Colors.white,
      ),
      body: Consumer<ServicesProvider>(
        builder: (context, servicesProvider, child) {
          return Stepper(
            currentStep: _currentStep,
            onStepContinue: () {
              if (_currentStep == 0) {
                if (_formKey.currentState!.validate()) {
                  _nextStep();
                }
              } else if (_currentStep == 1) {
                if (_selectedActionServiceId != null && _selectedActionId != null) {
                  _nextStep();
                }
              } else if (_currentStep == 2) {
                if (_selectedReactionServiceId != null && _selectedReactionId != null) {
                  _createArea();
                }
              }
            },
            onStepCancel: _currentStep > 0 ? _previousStep : null,
            controlsBuilder: (context, details) {
              return Padding(
                padding: EdgeInsets.only(top: 16),
                child: Row(
                  children: [
                    ElevatedButton(
                      onPressed: details.onStepContinue,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Color(0xff0a4a0e),
                        foregroundColor: Colors.white,
                      ),
                      child: Text(_currentStep == 2 ? 'Créer' : 'Continuer'),
                    ),
                    if (_currentStep > 0) ...[
                      SizedBox(width: 12),
                      TextButton(
                        onPressed: details.onStepCancel,
                        child: Text('Retour'),
                      ),
                    ],
                  ],
                ),
              );
            },
            steps: [
              // Étape 1: Nom et Description
              Step(
                title: Text('Informations'),
                content: Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      TextFormField(
                        controller: _nameController,
                        decoration: InputDecoration(
                          labelText: 'Nom de l\'AREA',
                          hintText: 'Donnez un nom à votre AREA',
                          prefixIcon: Icon(Icons.label),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Veuillez entrer un nom pour l\'AREA';
                          }
                          if (value.length < 3) {
                            return 'Le nom doit contenir au moins 3 caractères';
                          }
                          return null;
                        },
                      ),
                      SizedBox(height: 16),
                      TextFormField(
                        controller: _descriptionController,
                        maxLines: 3,
                        decoration: InputDecoration(
                          labelText: 'Description (Optionnel)',
                          hintText: 'Décrivez ce que fait cette AREA',
                          prefixIcon: Icon(Icons.description),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                      SizedBox(height: 16),
                      Row(
                        children: [
                          Icon(Icons.power_settings_new, color: Colors.grey[600]),
                          SizedBox(width: 8),
                          Text('Activer l\'AREA'),
                          Spacer(),
                          Switch(
                            value: _enabled,
                            onChanged: (value) {
                              setState(() {
                                _enabled = value;
                              });
                            },
                            activeColor: Color(0xff0a4a0e),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                isActive: _currentStep >= 0,
                state: _currentStep > 0 ? StepState.complete : StepState.indexed,
              ),
              
              // Étape 2: Sélection ACTION
              Step(
                title: Text('Action (Déclencheur)'),
                content: _buildActionSelection(servicesProvider),
                isActive: _currentStep >= 1,
                state: _currentStep > 1 ? StepState.complete : StepState.indexed,
              ),
              
              // Étape 3: Sélection REACTION
              Step(
                title: Text('Réaction (Réponse)'),
                content: _buildReactionSelection(servicesProvider),
                isActive: _currentStep >= 2,
                state: _currentStep > 2 ? StepState.complete : StepState.indexed,
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildActionSelection(ServicesProvider provider) {
    // Utiliser les services mock avec actions/réactions
    final servicesWithActions = MOCK_SERVICES.where((s) => s.actions.isNotEmpty).toList();
    
    MockService? selectedService;
    if (_selectedActionServiceId != null) {
      try {
        selectedService = servicesWithActions.firstWhere((s) => s.id == _selectedActionServiceId);
      } catch (e) {
        selectedService = null;
      }
    }
    
    MockServiceAction? selectedAction;
    if (selectedService != null && _selectedActionId != null) {
      try {
        selectedAction = selectedService.actions.firstWhere((a) => a.id == _selectedActionId);
      } catch (e) {
        selectedAction = null;
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Sélectionnez un service et une action',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 16),
        DropdownButtonFormField<String>(
          decoration: InputDecoration(
            labelText: 'Service',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
          ),
          value: _selectedActionServiceId,
          items: servicesWithActions.map((service) {
            return DropdownMenuItem(
              value: service.id,
              child: Text(service.displayName),
            );
          }).toList(),
          onChanged: (serviceId) {
            setState(() {
              _selectedActionServiceId = serviceId;
              _selectedActionId = null;
            });
          },
        ),
        if (selectedService != null) ...[
          SizedBox(height: 16),
          DropdownButtonFormField<String>(
            decoration: InputDecoration(
              labelText: 'Action',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            ),
            value: _selectedActionId,
            items: selectedService.actions.map((action) {
              return DropdownMenuItem(
                value: action.id,
                child: Text(action.name),
              );
            }).toList(),
            onChanged: (actionId) {
              setState(() {
                _selectedActionId = actionId;
              });
            },
          ),
          if (selectedAction != null) ...[
            SizedBox(height: 16),
            Card(
              color: Color(0xff0a4a0e).withOpacity(0.1),
              child: Padding(
                padding: EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      selectedAction.name,
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 4),
                    Text(
                      selectedAction.description,
                      style: TextStyle(fontSize: 12, color: Colors.grey[700]),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ],
    );
  }

  Widget _buildReactionSelection(ServicesProvider provider) {
    // Utiliser les services mock avec actions/réactions
    final servicesWithReactions = MOCK_SERVICES.where((s) => s.reactions.isNotEmpty).toList();
    
    MockService? selectedService;
    if (_selectedReactionServiceId != null) {
      try {
        selectedService = servicesWithReactions.firstWhere((s) => s.id == _selectedReactionServiceId);
      } catch (e) {
        selectedService = null;
      }
    }
    
    MockServiceReaction? selectedReaction;
    if (selectedService != null && _selectedReactionId != null) {
      try {
        selectedReaction = selectedService.reactions.firstWhere((r) => r.id == _selectedReactionId);
      } catch (e) {
        selectedReaction = null;
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Sélectionnez un service et une réaction',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 16),
        DropdownButtonFormField<String>(
          decoration: InputDecoration(
            labelText: 'Service',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
          ),
          value: _selectedReactionServiceId,
          items: servicesWithReactions.map((service) {
            return DropdownMenuItem(
              value: service.id,
              child: Text(service.displayName),
            );
          }).toList(),
          onChanged: (serviceId) {
            setState(() {
              _selectedReactionServiceId = serviceId;
              _selectedReactionId = null;
            });
          },
        ),
        if (selectedService != null) ...[
          SizedBox(height: 16),
          DropdownButtonFormField<String>(
            decoration: InputDecoration(
              labelText: 'Réaction',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            ),
            value: _selectedReactionId,
            items: selectedService.reactions.map((reaction) {
              return DropdownMenuItem(
                value: reaction.id,
                child: Text(reaction.name),
              );
            }).toList(),
            onChanged: (reactionId) {
              setState(() {
                _selectedReactionId = reactionId;
              });
            },
          ),
          if (selectedReaction != null) ...[
            SizedBox(height: 16),
            Card(
              color: Color(0xff0a4a0e).withOpacity(0.1),
              child: Padding(
                padding: EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      selectedReaction.name,
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 4),
                    Text(
                      selectedReaction.description,
                      style: TextStyle(fontSize: 12, color: Colors.grey[700]),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
        SizedBox(height: 16),
        Consumer<AreasProvider>(
          builder: (context, areasProvider, child) {
            if (areasProvider.error != null) {
              return Container(
                padding: EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red[50],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red[300]!),
                ),
                child: Row(
                  children: [
                    Icon(Icons.error_outline, color: Colors.red[700]),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        areasProvider.error!,
                        style: TextStyle(color: Colors.red[700]),
                      ),
                    ),
                  ],
                ),
              );
            }
            return SizedBox.shrink();
          },
        ),
      ],
    );
  }
}
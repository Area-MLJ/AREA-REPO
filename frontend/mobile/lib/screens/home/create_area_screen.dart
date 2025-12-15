import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/areas_provider.dart';
import '../../providers/services_provider.dart';
import '../../models/service.dart';

enum CreateAreaStep { info, action, reaction, review }

class CreateAreaScreen extends StatefulWidget {
  @override
  _CreateAreaScreenState createState() => _CreateAreaScreenState();
}

class _CreateAreaScreenState extends State<CreateAreaScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  
  CreateAreaStep _currentStep = CreateAreaStep.info;
  String? _selectedActionService;
  String? _selectedAction;
  String? _selectedReactionService;
  String? _selectedReaction;

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

  bool get canProceed {
    switch (_currentStep) {
      case CreateAreaStep.info:
        return _nameController.text.trim().isNotEmpty && 
               _descriptionController.text.trim().isNotEmpty;
      case CreateAreaStep.action:
        return _selectedActionService != null && _selectedAction != null;
      case CreateAreaStep.reaction:
        return _selectedReactionService != null && _selectedReaction != null;
      case CreateAreaStep.review:
        return true;
    }
  }

  void _nextStep() {
    if (!canProceed) return;
    
    setState(() {
      switch (_currentStep) {
        case CreateAreaStep.info:
          _currentStep = CreateAreaStep.action;
          break;
        case CreateAreaStep.action:
          _currentStep = CreateAreaStep.reaction;
          break;
        case CreateAreaStep.reaction:
          _currentStep = CreateAreaStep.review;
          break;
        case CreateAreaStep.review:
          _createArea();
          break;
      }
    });
  }

  void _previousStep() {
    setState(() {
      switch (_currentStep) {
        case CreateAreaStep.action:
          _currentStep = CreateAreaStep.info;
          break;
        case CreateAreaStep.reaction:
          _currentStep = CreateAreaStep.action;
          break;
        case CreateAreaStep.review:
          _currentStep = CreateAreaStep.reaction;
          break;
        case CreateAreaStep.info:
          Navigator.of(context).pop();
          break;
      }
    });
  }

  void _createArea() async {
    if (!_formKey.currentState!.validate()) return;

    final areasProvider = Provider.of<AreasProvider>(context, listen: false);
    await areasProvider.createArea(
      _nameController.text,
      description: _descriptionController.text.isEmpty ? null : _descriptionController.text,
      enabled: true,
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Créer une AREA'),
        backgroundColor: Color(0xFF0A4A0E),
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          _buildProgressIndicator(),
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(16),
              child: _buildStepContent(),
            ),
          ),
          _buildNavigationButtons(),
        ],
      ),
    );
  }

  Widget _buildProgressIndicator() {
    final steps = [
      CreateAreaStep.info,
      CreateAreaStep.action,
      CreateAreaStep.reaction,
      CreateAreaStep.review
    ];
    final currentIndex = steps.indexOf(_currentStep);

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: List.generate(steps.length, (index) {
          return Expanded(
            child: Container(
              margin: EdgeInsets.symmetric(horizontal: 2),
              height: 6,
              decoration: BoxDecoration(
                color: index <= currentIndex
                    ? Color(0xFF0A4A0E)
                    : Color(0xFFD1CFC8),
                borderRadius: BorderRadius.circular(3),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case CreateAreaStep.info:
        return _buildInfoStep();
      case CreateAreaStep.action:
        return _buildActionStep();
      case CreateAreaStep.reaction:
        return _buildReactionStep();
      case CreateAreaStep.review:
        return _buildReviewStep();
    }
  }

  Widget _buildInfoStep() {
    return Form(
      key: _formKey,
      child: Card(
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        child: Padding(
          padding: EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Informations générales',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1A1A18),
                ),
              ),
              SizedBox(height: 24),
              TextFormField(
                controller: _nameController,
                decoration: InputDecoration(
                  labelText: 'Nom de l\'AREA',
                  hintText: 'Ex: Backup Gmail vers OneDrive',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: Color(0xFF0A4A0E), width: 2),
                  ),
                ),
                onChanged: (_) => setState(() {}),
              ),
              SizedBox(height: 16),
              TextFormField(
                controller: _descriptionController,
                maxLines: 3,
                decoration: InputDecoration(
                  labelText: 'Description',
                  hintText: 'Ex: Sauvegarde automatique des pièces jointes',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: Color(0xFF0A4A0E), width: 2),
                  ),
                ),
                onChanged: (_) => setState(() {}),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActionStep() {
    return Consumer<ServicesProvider>(
      builder: (context, servicesProvider, child) {
        final connectedServices = servicesProvider.services
            .where((s) => s.isConnected && s.actions.isNotEmpty)
            .toList();

        if (connectedServices.isEmpty) {
          return Card(
            child: Padding(
              padding: EdgeInsets.all(20),
              child: Center(
                child: Column(
                  children: [
                    Icon(Icons.info_outline, size: 48, color: Colors.grey),
                    SizedBox(height: 16),
                    Text(
                      'Aucun service avec Actions connecté.',
                      style: TextStyle(fontSize: 16),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
          );
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Choisir une Action',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1A1A18),
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Sélectionnez le déclencheur de votre automation',
                      style: TextStyle(color: Color(0xFF6B6962)),
                    ),
                    SizedBox(height: 20),
                    GridView.builder(
                      shrinkWrap: true,
                      physics: NeverScrollableScrollPhysics(),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 1.2,
                      ),
                      itemCount: connectedServices.length,
                      itemBuilder: (context, index) {
                        final service = connectedServices[index];
                        final isSelected = _selectedActionService == service.id;
                        return _buildServiceCard(service, isSelected, () {
                          setState(() {
                            _selectedActionService = service.id;
                            _selectedAction = null;
                          });
                        });
                      },
                    ),
                    if (_selectedActionService != null) ...[
                      SizedBox(height: 24),
                      Text(
                        'Sélectionnez une action',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF1A1A18),
                        ),
                      ),
                      SizedBox(height: 12),
                      ...connectedServices
                          .firstWhere((s) => s.id == _selectedActionService)
                          .actions
                          .map((action) => _buildActionReactionTile(
                                action.name,
                                action.description ?? '',
                                _selectedAction == action.id,
                                () {
                                  setState(() {
                                    _selectedAction = action.id;
                                  });
                                },
                              )),
                    ],
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildReactionStep() {
    return Consumer<ServicesProvider>(
      builder: (context, servicesProvider, child) {
        final connectedServices = servicesProvider.services
            .where((s) => s.isConnected && s.reactions.isNotEmpty)
            .toList();

        if (connectedServices.isEmpty) {
          return Card(
            child: Padding(
              padding: EdgeInsets.all(20),
              child: Center(
                child: Column(
                  children: [
                    Icon(Icons.info_outline, size: 48, color: Colors.grey),
                    SizedBox(height: 16),
                    Text(
                      'Aucun service avec REActions connecté.',
                      style: TextStyle(fontSize: 16),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
          );
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Choisir une REAction',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1A1A18),
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Sélectionnez l\'action à exécuter',
                      style: TextStyle(color: Color(0xFF6B6962)),
                    ),
                    SizedBox(height: 20),
                    GridView.builder(
                      shrinkWrap: true,
                      physics: NeverScrollableScrollPhysics(),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 1.2,
                      ),
                      itemCount: connectedServices.length,
                      itemBuilder: (context, index) {
                        final service = connectedServices[index];
                        final isSelected = _selectedReactionService == service.id;
                        return _buildServiceCard(service, isSelected, () {
                          setState(() {
                            _selectedReactionService = service.id;
                            _selectedReaction = null;
                          });
                        });
                      },
                    ),
                    if (_selectedReactionService != null) ...[
                      SizedBox(height: 24),
                      Text(
                        'Sélectionnez une réaction',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF1A1A18),
                        ),
                      ),
                      SizedBox(height: 12),
                      ...connectedServices
                          .firstWhere((s) => s.id == _selectedReactionService)
                          .reactions
                          .map((reaction) => _buildActionReactionTile(
                                reaction.name,
                                reaction.description ?? '',
                                _selectedReaction == reaction.id,
                                () {
                                  setState(() {
                                    _selectedReaction = reaction.id;
                                  });
                                },
                              )),
                    ],
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildReviewStep() {
    return Consumer<ServicesProvider>(
      builder: (context, servicesProvider, child) {
        Service? actionService;
        Service? reactionService;
        
        try {
          actionService = servicesProvider.services
              .firstWhere((s) => s.id == _selectedActionService);
        } catch (e) {
          actionService = null;
        }
        
        try {
          reactionService = servicesProvider.services
              .firstWhere((s) => s.id == _selectedReactionService);
        } catch (e) {
          reactionService = null;
        }

        return Card(
          elevation: 4,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: Padding(
            padding: EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Récapitulatif',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1A1A18),
                  ),
                ),
                SizedBox(height: 24),
                _buildReviewField('Nom', _nameController.text),
                SizedBox(height: 16),
                _buildReviewField('Description', _descriptionController.text),
                SizedBox(height: 24),
                Container(
                  padding: EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Color(0xFFE8E6E1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    children: [
                      _buildReviewServiceBox(
                        'ACTION',
                        actionService?.displayName ?? '',
                        actionService?.actions
                                .cast<ServiceAction?>()
                                .firstWhere((a) => a?.id == _selectedAction, orElse: () => null)
                                ?.name ??
                            '',
                        Colors.blue,
                      ),
                      SizedBox(height: 16),
                      Icon(Icons.arrow_downward, color: Color(0xFF0A4A0E), size: 32),
                      SizedBox(height: 16),
                      _buildReviewServiceBox(
                        'REACTION',
                        reactionService?.displayName ?? '',
                        reactionService?.reactions
                                .cast<ServiceReaction?>()
                                .firstWhere((r) => r?.id == _selectedReaction, orElse: () => null)
                                ?.name ??
                            '',
                        Colors.green,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildServiceCard(Service service, bool isSelected, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? Color(0xFFE6F2E7) : Colors.white,
          border: Border.all(
            color: isSelected ? Color(0xFF0A4A0E) : Color(0xFFD1CFC8),
            width: 2,
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              service.getEmoji(),
              style: TextStyle(fontSize: 32),
            ),
            SizedBox(height: 8),
            Text(
              service.displayName ?? service.name,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Color(0xFF1A1A18),
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionReactionTile(
    String name,
    String description,
    bool isSelected,
    VoidCallback onTap,
  ) {
    return Container(
      margin: EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: onTap,
        child: Container(
          padding: EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isSelected ? Color(0xFFE6F2E7) : Colors.white,
            border: Border.all(
              color: isSelected ? Color(0xFF0A4A0E) : Color(0xFFD1CFC8),
              width: 2,
            ),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                name,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF1A1A18),
                ),
              ),
              if (description.isNotEmpty) ...[
                SizedBox(height: 4),
                Text(
                  description,
                  style: TextStyle(
                    fontSize: 12,
                    color: Color(0xFF6B6962),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildReviewField(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Color(0xFF8B8980),
          ),
        ),
        SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w500,
            color: Color(0xFF1A1A18),
          ),
        ),
      ],
    );
  }

  Widget _buildReviewServiceBox(
    String label,
    String serviceName,
    String actionName,
    Color color,
  ) {
    return Container(
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Container(
            padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: color.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ),
          SizedBox(height: 8),
          Text(
            serviceName,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1A1A18),
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 4),
          Text(
            actionName,
            style: TextStyle(
              fontSize: 12,
              color: Color(0xFF6B6962),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildNavigationButtons() {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: Offset(0, -5),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: _previousStep,
              style: OutlinedButton.styleFrom(
                padding: EdgeInsets.symmetric(vertical: 16),
                side: BorderSide(color: Color(0xFF0A4A0E)),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text(
                _currentStep == CreateAreaStep.info ? 'Annuler' : 'Précédent',
                style: TextStyle(
                  color: Color(0xFF0A4A0E),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          SizedBox(width: 12),
          Expanded(
            child: Consumer<AreasProvider>(
              builder: (context, areasProvider, child) {
                return ElevatedButton(
                  onPressed: (canProceed && !areasProvider.isLoading)
                      ? _nextStep
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFF0A4A0E),
                    padding: EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: areasProvider.isLoading
                      ? SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : Text(
                          _currentStep == CreateAreaStep.review
                              ? 'Créer l\'AREA'
                              : 'Suivant',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
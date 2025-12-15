import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/services_provider.dart';
import '../../models/service.dart';

class ServicesScreen extends StatefulWidget {
  @override
  _ServicesScreenState createState() => _ServicesScreenState();
}

class _ServicesScreenState extends State<ServicesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ServicesProvider>(context, listen: false).fetchServices();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Services'),
        automaticallyImplyLeading: false,
        backgroundColor: Color(0xFF0A4A0E),
        foregroundColor: Colors.white,
      ),
      body: Consumer<ServicesProvider>(
        builder: (context, servicesProvider, child) {
          if (servicesProvider.isLoading && servicesProvider.services.isEmpty) {
            return Center(child: CircularProgressIndicator());
          }

          if (servicesProvider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.error_outline,
                    size: 64,
                    color: Colors.red[400],
                  ),
                  SizedBox(height: 16),
                  Text(
                    'Error loading services',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.red[700],
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    servicesProvider.error!,
                    style: TextStyle(color: Colors.red[600]),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => servicesProvider.fetchServices(),
                    child: Text('Retry'),
                  ),
                ],
              ),
            );
          }

          if (servicesProvider.services.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.apps,
                    size: 80,
                    color: Colors.grey[400],
                  ),
                  SizedBox(height: 16),
                  Text(
                    'No services available',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey[600],
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Check back later for available services',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: servicesProvider.fetchServices,
            child: SingleChildScrollView(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Services',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1A1A18),
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Connectez vos services pour créer des automatisations',
                    style: TextStyle(
                      fontSize: 14,
                      color: Color(0xFF6B6962),
                    ),
                  ),
                  SizedBox(height: 20),
                  ...servicesProvider.services.map((service) => _buildServiceCard(service)),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildServiceCard(Service service) {
    return Card(
      elevation: 2,
      margin: EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Color(0xFFD1CFC8), width: 1),
      ),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  service.getEmoji(),
                  style: TextStyle(fontSize: 40),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        service.displayName ?? service.name,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1A1A18),
                        ),
                      ),
                      SizedBox(height: 4),
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.grey[200],
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          service.getCategoryLabel(),
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.grey[700],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: service.isConnected
                        ? Colors.green[100]
                        : Colors.grey[200],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    service.isConnected ? 'Connecté' : 'Non connecté',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: service.isConnected
                          ? Colors.green[800]
                          : Colors.grey[700],
                    ),
                  ),
                ),
              ],
            ),
            if (service.description != null) ...[
              SizedBox(height: 12),
              Text(
                service.description!,
                style: TextStyle(
                  color: Color(0xFF6B6962),
                  fontSize: 13,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'ACTIONS (${service.actions.length})',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF8B8980),
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        service.actions.isEmpty
                            ? 'Aucune'
                            : service.actions
                                .take(2)
                                .map((a) => a.displayName ?? a.name)
                                .join(', '),
                        style: TextStyle(
                          fontSize: 12,
                          color: Color(0xFF4D4C47),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'REACTIONS (${service.reactions.length})',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF8B8980),
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        service.reactions.isEmpty
                            ? 'Aucune'
                            : service.reactions
                                .take(2)
                                .map((r) => r.displayName ?? r.name)
                                .join(', '),
                        style: TextStyle(
                          fontSize: 12,
                          color: Color(0xFF4D4C47),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  _toggleConnection(service);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: service.isConnected
                      ? Colors.white
                      : Color(0xFF0A4A0E),
                  foregroundColor: service.isConnected
                      ? Color(0xFF0A4A0E)
                      : Colors.white,
                  side: BorderSide(
                    color: Color(0xFF0A4A0E),
                    width: service.isConnected ? 2 : 0,
                  ),
                  padding: EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: Text(
                  service.isConnected ? 'Déconnecter' : 'Connecter',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _toggleConnection(Service service) {
    setState(() {
      service.isConnected = !service.isConnected;
    });
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          service.isConnected
              ? '${service.displayName ?? service.name} connecté'
              : '${service.displayName ?? service.name} déconnecté',
        ),
        backgroundColor: service.isConnected ? Colors.green : Colors.grey[700],
        duration: Duration(seconds: 2),
      ),
    );
  }
}
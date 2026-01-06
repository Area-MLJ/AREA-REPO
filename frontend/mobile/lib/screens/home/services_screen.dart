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
            child: ListView.builder(
              padding: EdgeInsets.all(16),
              itemCount: servicesProvider.services.length,
              itemBuilder: (context, index) {
                final service = servicesProvider.services[index];
                return _buildServiceCard(service);
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildServiceCard(Service service) {
    return Card(
      elevation: 4,
      margin: EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: Color(0xFF0A4A0E).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: service.iconUrl != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.network(
                            service.iconUrl!,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Icon(
                                Icons.apps,
                                color: Colors.blue[600],
                                size: 24,
                              );
                            },
                          ),
                        )
                      : Icon(
                          Icons.apps,
                          color: Color(0xFF0A4A0E),
                          size: 24,
                        ),
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
                          color: Colors.grey[800],
                        ),
                      ),
                      if (service.description != null) ...[
                        SizedBox(height: 4),
                        Text(
                          service.description!,
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 14,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: 16),
            Row(
              children: [
                _buildFeatureChip(
                  Icons.play_arrow,
                  '${service.actions.length} action${service.actions.length != 1 ? 's' : ''}',
                  Colors.blue,
                ),
                SizedBox(width: 8),
                _buildFeatureChip(
                  Icons.bolt,
                  '${service.reactions.length} reaction${service.reactions.length != 1 ? 's' : ''}',
                  Colors.orange,
                ),
              ],
            ),
            if (service.actions.isNotEmpty || service.reactions.isNotEmpty) ...[
              SizedBox(height: 12),
              ExpansionTile(
                title: Text(
                  'Available Features',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                children: [
                  if (service.actions.isNotEmpty) ...[
                    _buildFeatureSection('Actions', service.actions.map((a) => a.displayName ?? a.name).toList()),
                  ],
                  if (service.reactions.isNotEmpty) ...[
                    _buildFeatureSection('Reactions', service.reactions.map((r) => r.displayName ?? r.name).toList()),
                  ],
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureChip(IconData icon, String label, Color color) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureSection(String title, List<String> features) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 14,
              color: Colors.grey[700],
            ),
          ),
          SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 4,
            children: features.map((feature) {
              return Chip(
                label: Text(
                  feature,
                  style: TextStyle(fontSize: 12),
                ),
                backgroundColor: Colors.grey[100],
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
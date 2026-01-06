import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/areas_provider.dart';
import '../../models/area.dart';
import 'create_area_screen.dart';

class AreasScreen extends StatefulWidget {
  @override
  _AreasScreenState createState() => _AreasScreenState();
}

class _AreasScreenState extends State<AreasScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<AreasProvider>(context, listen: false).fetchAreas();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('ACTION-REACTION'),
        automaticallyImplyLeading: false,
      ),
      body: Consumer<AreasProvider>(
        builder: (context, areasProvider, child) {
          if (areasProvider.isLoading && areasProvider.areas.isEmpty) {
            return Center(child: CircularProgressIndicator());
          }

          if (areasProvider.error != null) {
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
                    'Error loading areas',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.red[700],
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    areasProvider.error!,
                    style: TextStyle(color: Colors.red[600]),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => areasProvider.fetchAreas(),
                    child: Text('Retry'),
                  ),
                ],
              ),
            );
          }

          if (areasProvider.areas.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.wb_auto,
                    size: 80,
                    color: Colors.grey[400],
                  ),
                  SizedBox(height: 16),
                  Text(
                    'No areas yet',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey[600],
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Create your first automation area',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey[600],
                    ),
                  ),
                  SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => CreateAreaScreen()),
                      );
                    },
                    icon: Icon(Icons.add),
                    label: Text('Create Area'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Color(0xFF0A4A0E),
                      foregroundColor: Colors.white,
                      padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    ),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: areasProvider.fetchAreas,
            child: ListView.builder(
              padding: EdgeInsets.all(16),
              itemCount: areasProvider.areas.length,
              itemBuilder: (context, index) {
                final area = areasProvider.areas[index];
                return _buildAreaCard(area);
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => CreateAreaScreen()),
          );
        },
        backgroundColor: Color(0xFF0A4A0E),
        child: Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildAreaCard(Area area) {
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
                Expanded(
                  child: Text(
                    area.name ?? 'Unnamed Area',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey[800],
                    ),
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: area.enabled ? Colors.green[100] : Colors.red[100],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    area.enabled ? 'Active' : 'Inactive',
                    style: TextStyle(
                      color: area.enabled ? Colors.green[800] : Colors.red[800],
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
            if (area.description != null) ...[
              SizedBox(height: 8),
              Text(
                area.description!,
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 14,
                ),
              ),
            ],
            SizedBox(height: 12),
            Row(
              children: [
                _buildCountChip(
                  Icons.play_arrow,
                  '${area.actions.length} action${area.actions.length != 1 ? 's' : ''}',
                  Colors.blue,
                ),
                SizedBox(width: 8),
                _buildCountChip(
                  Icons.bolt,
                  '${area.reactions.length} reaction${area.reactions.length != 1 ? 's' : ''}',
                  Colors.orange,
                ),
              ],
            ),
            SizedBox(height: 12),
            Text(
              'Created ${DateFormat.yMMMd().format(area.createdAt)}',
              style: TextStyle(
                color: Colors.grey[500],
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCountChip(IconData icon, String label, Color color) {
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
}
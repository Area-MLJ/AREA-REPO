import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/areas_provider.dart';
import '../../models/area.dart';
import '../../services/api_service.dart';
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
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text('Dashboard', style: TextStyle(color: Color(0xFF1A1A18))),
        backgroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
      body: Consumer<AreasProvider>(
        builder: (context, areasProvider, child) {
          return RefreshIndicator(
            onRefresh: areasProvider.fetchAreas,
            child: SingleChildScrollView(
              padding: EdgeInsets.all(16),
              physics: AlwaysScrollableScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Dashboard', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w600, color: Color(0xFF1A1A18))),
                  SizedBox(height: 4),
                  Text('Gérez vos automatisations', style: TextStyle(fontSize: 14, color: Color(0xFF6B6962))),
                  SizedBox(height: 16),
                  
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => CreateAreaScreen())),
                      style: ElevatedButton.styleFrom(backgroundColor: Color(0xff0a4a0e), foregroundColor: Colors.white, padding: EdgeInsets.symmetric(vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                      child: Text('+ Nouvelle AREA', style: TextStyle(fontSize: 16)),
                    ),
                  ),
                  SizedBox(height: 24),

                  if (areasProvider.isLoading && areasProvider.areas.isEmpty)
                    Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()))
                  else ...[
                    Row(
                      children: [
                        Expanded(child: _buildStatCard('Total', '${areasProvider.areas.length}', Color(0xff0a4a0e))),
                        SizedBox(width: 12),
                        Expanded(child: _buildStatCard('Actives', '${areasProvider.areas.where((a) => a.enabled).length}', Color(0xFF10B981))),
                        SizedBox(width: 12),
                        Expanded(child: _buildStatCard('Inactives', '${areasProvider.areas.where((a) => !a.enabled).length}', Color(0xFF8B8980))),
                      ],
                    ),
                    SizedBox(height: 24),

                    Text('Mes AREAs', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: Color(0xFF1A1A18))),
                    SizedBox(height: 16),

                    if (areasProvider.error != null)
                      Card(
                        color: Colors.orange[50],
                        child: Padding(
                          padding: EdgeInsets.all(12),
                          child: Row(
                            children: [
                              Icon(Icons.warning, color: Colors.orange[700]),
                              SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'Impossible de charger certaines données. ${areasProvider.error}',
                                  style: TextStyle(color: Colors.orange[900], fontSize: 12),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    
                    if (areasProvider.error != null) SizedBox(height: 16),

                    if (areasProvider.areas.isEmpty) _buildEmptyState() else ...areasProvider.areas.map((area) => _buildAreaCard(area)).toList(),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color color) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8), side: BorderSide(color: Color(0xFFE5E3DD))),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(fontSize: 12, color: Color(0xFF6B6962))),
            SizedBox(height: 4),
            Text(value, style: TextStyle(fontSize: 28, fontWeight: FontWeight.w600, color: color)),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8), side: BorderSide(color: Color(0xFFE5E3DD))),
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: 48, horizontal: 24),
        child: Column(
          children: [
            Text('🤖', style: TextStyle(fontSize: 48)),
            SizedBox(height: 16),
            Text('Aucune AREA créée', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: Color(0xFF1A1A18))),
            SizedBox(height: 8),
            Text('Commencez par créer votre première automation', style: TextStyle(fontSize: 14, color: Color(0xFF6B6962)), textAlign: TextAlign.center),
            SizedBox(height: 24),
            ElevatedButton(onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => CreateAreaScreen())), style: ElevatedButton.styleFrom(backgroundColor: Color(0xff0a4a0e), foregroundColor: Colors.white, padding: EdgeInsets.symmetric(horizontal: 32, vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))), child: Text('Créer une AREA')),
          ],
        ),
      ),
    );
  }

  Widget _buildAreaCard(Area area) {
    return Card(
      elevation: 2,
      margin: EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Flexible(child: Text(area.name ?? 'Sans nom', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Color(0xFF1A1A18)))),
                SizedBox(width: 8),
                if (area.isBuiltin) Container(padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: Color(0xff0a4a0e).withOpacity(0.1), borderRadius: BorderRadius.circular(4)), child: Text('Built-in', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Color(0xff0a4a0e)))),
                SizedBox(width: 8),
                Container(padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: area.enabled ? Color(0xFF10B981).withOpacity(0.1) : Colors.grey.withOpacity(0.1), borderRadius: BorderRadius.circular(4)), child: Text(area.enabled ? 'Active' : 'Inactive', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: area.enabled ? Color(0xFF10B981) : Colors.grey))),
              ],
            ),
            SizedBox(height: 8),
            if (area.description != null) Text(area.description!, style: TextStyle(fontSize: 13, color: Color(0xFF6B6962))),
            SizedBox(height: 12),
            Text('Créée le ${DateFormat.yMMMd('fr_FR').format(area.createdAt)}', style: TextStyle(fontSize: 12, color: Color(0xFF8B8980))),
            SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: ElevatedButton(onPressed: () async {try {await ApiService.updateArea(area.id, enabled: !area.enabled); Provider.of<AreasProvider>(context, listen: false).fetchAreas();} catch (e) {ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur : ${e.toString()}')));}}, style: ElevatedButton.styleFrom(backgroundColor: area.enabled ? Colors.white : Color(0xff0a4a0e), foregroundColor: area.enabled ? Color(0xff0a4a0e) : Colors.white, elevation: 0, side: area.enabled ? BorderSide(color: Color(0xFFE5E3DD)) : null, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6))), child: Text(area.enabled ? 'Désactiver' : 'Activer', style: TextStyle(fontSize: 13)))),
                SizedBox(width: 8),
                Expanded(child: ElevatedButton(onPressed: () {}, style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: Color(0xff0a4a0e), elevation: 0, side: BorderSide(color: Color(0xFFE5E3DD)), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6))), child: Text('Configurer', style: TextStyle(fontSize: 13)))),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

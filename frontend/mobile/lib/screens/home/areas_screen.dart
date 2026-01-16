import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/areas_provider.dart';
import '../../models/area.dart';
import '../../services/api_service.dart';
import '../../l10n/app_localizations.dart';
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

  String _formatDate(DateTime date) {
    final months = ['jan.', 'fév.', 'mar.', 'avr.', 'mai', 'juin', 'juil.', 'aoû.', 'sep.', 'oct.', 'nov.', 'déc.'];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context);
    
    return Scaffold(
      backgroundColor: Colors.white,
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
                  Text(localizations?.translate('dashboard') ?? 'Dashboard', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w600, color: Color(0xFF1A1A18))),
                  SizedBox(height: 4),
                  Text(localizations?.translate('manage_automations') ?? 'Gérez vos automatisations', style: TextStyle(fontSize: 14, color: Color(0xFF6B6962))),
                  SizedBox(height: 16),
                  
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => CreateAreaScreen())),
                      style: ElevatedButton.styleFrom(backgroundColor: Color(0xff0a4a0e), foregroundColor: Colors.white, padding: EdgeInsets.symmetric(vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                      child: Text(localizations?.translate('new_area_button') ?? '+ Nouvelle AREA', style: TextStyle(fontSize: 16)),
                    ),
                  ),
                  SizedBox(height: 24),

                  if (areasProvider.isLoading && areasProvider.areas.isEmpty)
                    Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()))
                  else ...[
                    Row(
                      children: [
                        Expanded(child: _buildStatCard(localizations?.translate('total') ?? 'Total', '${areasProvider.areas.length}', Color(0xff0a4a0e))),
                        SizedBox(width: 12),
                        Expanded(child: _buildStatCard(localizations?.translate('active') ?? 'Actives', '${areasProvider.areas.where((a) => a.enabled).length}', Color(0xFF10B981))),
                        SizedBox(width: 12),
                        Expanded(child: _buildStatCard(localizations?.translate('inactive') ?? 'Inactives', '${areasProvider.areas.where((a) => !a.enabled).length}', Color(0xFF8B8980))),
                      ],
                    ),
                    SizedBox(height: 24),

                    Text(localizations?.translate('my_areas') ?? 'Mes AREAs', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: Color(0xFF1A1A18))),
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
                                  '${localizations?.translate('error_loading') ?? 'Impossible de charger certaines données.'} ${areasProvider.error}',
                                  style: TextStyle(color: Colors.orange[900], fontSize: 12),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    
                    if (areasProvider.error != null) SizedBox(height: 16),

                    if (areasProvider.areas.isEmpty) _buildEmptyState(localizations) else ...areasProvider.areas.map((area) => _buildAreaCard(area, localizations)).toList(),
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

  Widget _buildEmptyState(AppLocalizations? localizations) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8), side: BorderSide(color: Color(0xFFE5E3DD))),
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: 48, horizontal: 24),
        child: Column(
          children: [
            Text('🤖', style: TextStyle(fontSize: 48)),
            SizedBox(height: 16),
            Text(localizations?.translate('no_areas') ?? 'Aucune AREA créée', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: Color(0xFF1A1A18))),
            SizedBox(height: 8),
            Text(localizations?.translate('no_areas_desc') ?? 'Commencez par créer votre première automation', style: TextStyle(fontSize: 14, color: Color(0xFF6B6962)), textAlign: TextAlign.center),
            SizedBox(height: 24),
            ElevatedButton(onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => CreateAreaScreen())), style: ElevatedButton.styleFrom(backgroundColor: Color(0xff0a4a0e), foregroundColor: Colors.white, padding: EdgeInsets.symmetric(horizontal: 32, vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))), child: Text(localizations?.translate('create_area') ?? 'Créer une AREA')),
          ],
        ),
      ),
    );
  }

  Widget _buildAreaCard(Area area, AppLocalizations? localizations) {
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
                if (area.isBuiltin) Container(padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: Color(0xff0a4a0e).withOpacity(0.1), borderRadius: BorderRadius.circular(4)), child: Text(localizations?.translate('builtin') ?? 'Built-in', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Color(0xff0a4a0e)))),
                SizedBox(width: 8),
                Container(padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: area.enabled ? Color(0xFF10B981).withOpacity(0.1) : Colors.grey.withOpacity(0.1), borderRadius: BorderRadius.circular(4)), child: Text(area.enabled ? (localizations?.translate('active') ?? 'Active') : (localizations?.translate('inactive') ?? 'Inactive'), style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: area.enabled ? Color(0xFF10B981) : Colors.grey))),
              ],
            ),
            SizedBox(height: 8),
            if (area.description != null) Text(area.description!, style: TextStyle(fontSize: 13, color: Color(0xFF6B6962))),
            SizedBox(height: 12),
            Text('${localizations?.translate('created_on') ?? 'Créée le'} ${_formatDate(area.createdAt)}', style: TextStyle(fontSize: 12, color: Color(0xFF8B8980))),
            SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: ElevatedButton(onPressed: () async {try {await ApiService.updateArea(area.id, enabled: !area.enabled); Provider.of<AreasProvider>(context, listen: false).fetchAreas();} catch (e) {ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur : ${e.toString()}')));}}, style: ElevatedButton.styleFrom(backgroundColor: area.enabled ? Colors.white : Color(0xff0a4a0e), foregroundColor: area.enabled ? Color(0xff0a4a0e) : Colors.white, elevation: 0, side: area.enabled ? BorderSide(color: Color(0xFFE5E3DD)) : null, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6))), child: Text(area.enabled ? (localizations?.translate('deactivate') ?? 'Désactiver') : (localizations?.translate('activate') ?? 'Activer'), style: TextStyle(fontSize: 13)))),
                SizedBox(width: 8),
                Expanded(child: ElevatedButton(onPressed: () => _showEditDialog(context, area, localizations), style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: Color(0xff0a4a0e), elevation: 0, side: BorderSide(color: Color(0xFFE5E3DD)), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6))), child: Text(localizations?.translate('edit_area') ?? 'Modifier', style: TextStyle(fontSize: 13)))),
                SizedBox(width: 8),
                Expanded(child: ElevatedButton(onPressed: () => _showDeleteDialog(context, area, localizations), style: ElevatedButton.styleFrom(backgroundColor: Colors.red[50], foregroundColor: Colors.red[700], elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6))), child: Text(localizations?.translate('delete_area') ?? 'Supprimer', style: TextStyle(fontSize: 13)))),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showEditDialog(BuildContext context, Area area, AppLocalizations? localizations) {
    final nameController = TextEditingController(text: area.name);
    final descriptionController = TextEditingController(text: area.description);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(localizations?.translate('edit_area_title') ?? 'Modifier l\'AREA'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: InputDecoration(
                labelText: localizations?.translate('area_name') ?? 'Nom de l\'AREA',
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 16),
            TextField(
              controller: descriptionController,
              decoration: InputDecoration(
                labelText: localizations?.translate('area_description') ?? 'Description',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(localizations?.translate('cancel') ?? 'Annuler'),
          ),
          ElevatedButton(
            onPressed: () async {
              try {
                await ApiService.updateArea(
                  area.id,
                  name: nameController.text,
                  description: descriptionController.text,
                );
                Navigator.pop(context);
                Provider.of<AreasProvider>(context, listen: false).fetchAreas();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(localizations?.translate('area_updated') ?? 'AREA mise à jour')),
                );
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Erreur : ${e.toString()}')),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Color(0xff0a4a0e)),
            child: Text(localizations?.translate('save') ?? 'Enregistrer', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showDeleteDialog(BuildContext context, Area area, AppLocalizations? localizations) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(localizations?.translate('delete_confirm_title') ?? 'Supprimer l\'AREA'),
        content: Text(localizations?.translate('delete_confirm_message') ?? 'Êtes-vous sûr de vouloir supprimer cette AREA ? Cette action est irréversible.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(localizations?.translate('cancel') ?? 'Annuler'),
          ),
          ElevatedButton(
            onPressed: () async {
              try {
                await ApiService.deleteArea(area.id);
                Navigator.pop(context);
                Provider.of<AreasProvider>(context, listen: false).fetchAreas();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(localizations?.translate('area_deleted') ?? 'AREA supprimée')),
                );
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Erreur : ${e.toString()}')),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red[700]),
            child: Text(localizations?.translate('delete') ?? 'Supprimer', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}

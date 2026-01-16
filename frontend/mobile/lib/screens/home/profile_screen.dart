import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/areas_provider.dart';
import '../../providers/services_provider.dart';
import '../../l10n/app_localizations.dart';
import '../../widgets/language_switcher.dart';
import '../auth/login_screen.dart';
import '../info/about_screen.dart';

class ProfileScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context);
    
    return Scaffold(
      body: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          final user = authProvider.user;
          
          if (user == null) {
            return Center(child: Text(localizations?.translate('not_connected') ?? 'Non connecté'));
          }

          return SingleChildScrollView(
            padding: EdgeInsets.all(16),
            child: Column(
              children: [
                // Profile Header
                Card(
                  elevation: 4,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: Padding(
                    padding: EdgeInsets.all(24),
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 40,
                          backgroundColor: Color(0xff0a4a0e),
                          child: Text(
                            user.email[0].toUpperCase(),
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                        SizedBox(height: 16),
                        Text(
                          user.email,
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey[800],
                          ),
                        ),
                        SizedBox(height: 8),
                        Text(
                          localizations?.translate('manage_info') ?? 'Gérez vos informations personnelles',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 14,
                          ),
                        ),
                        SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              user.isVerified ? Icons.verified : Icons.warning,
                              color: user.isVerified ? Colors.green : Colors.orange,
                              size: 16,
                            ),
                            SizedBox(width: 4),
                            Text(
                              localizations?.translate(user.isVerified ? 'verified' : 'unverified') ?? 
                                  (user.isVerified ? 'Verified' : 'Unverified'),
                              style: TextStyle(
                                color: user.isVerified ? Colors.green : Colors.orange,
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                
                SizedBox(height: 24),
                
                // Statistics
                Consumer<AreasProvider>(
                  builder: (context, areasProvider, child) {
                    return Card(
                      elevation: 4,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: Padding(
                        padding: EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              localizations?.translate('statistics') ?? 'Statistics',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey[800],
                              ),
                            ),
                            SizedBox(height: 16),
                            Row(
                              children: [
                                Expanded(
                                  child: _buildStatItem(
                                    context,
                                    localizations?.translate('total_areas') ?? 'Total AREAs',
                                    '${areasProvider.areas.length}',
                                    Icons.wb_auto,
                                    Color(0xff0a4a0e),
                                  ),
                                ),
                                Expanded(
                                  child: _buildStatItem(
                                    context,
                                    localizations?.translate('active_areas') ?? 'AREAs actives',
                                    '${areasProvider.areas.where((area) => area.enabled).length}',
                                    Icons.play_circle,
                                    Colors.green,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
                
                SizedBox(height: 24),
                
                // Action Buttons
                Card(
                  elevation: 4,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          localizations?.translate('actions') ?? 'Actions',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey[800],
                          ),
                        ),
                        SizedBox(height: 16),
                        LanguageSwitcher(),
                        Divider(),
                        ListTile(
                          leading: Icon(Icons.refresh, color: Color(0xff0a4a0e)),
                          title: Text(localizations?.translate('refresh_data') ?? 'Actualiser les données'),
                          subtitle: Text(localizations?.translate('refresh_subtitle') ?? 'Recharger les AREAs et les services'),
                          onTap: () async {
                            final areasProvider = Provider.of<AreasProvider>(context, listen: false);
                            final servicesProvider = Provider.of<ServicesProvider>(context, listen: false);
                            await Future.wait([
                              areasProvider.fetchAreas(),
                              servicesProvider.fetchServices(),
                            ]);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text(localizations?.translate('data_refreshed') ?? 'Données actualisées')),
                            );
                          },
                        ),
                        Divider(),
                        ListTile(
                          leading: Icon(Icons.info, color: Color(0xff0a4a0e)),
                          title: Text(localizations?.translate('about') ?? 'À propos'),
                          subtitle: Text(localizations?.translate('about_subtitle') ?? 'En savoir plus sur AREA'),
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => AboutScreen()),
                            );
                          },
                        ),
                        Divider(),
                        ListTile(
                          leading: Icon(Icons.logout, color: Colors.red[600]),
                          title: Text(localizations?.translate('logout') ?? 'Déconnexion'),
                          subtitle: Text(localizations?.translate('logout_subtitle') ?? 'Se déconnecter de votre compte'),
                          onTap: () async {
                            final confirm = await showDialog<bool>(
                              context: context,
                              builder: (context) => AlertDialog(
                                title: Text(localizations?.translate('logout') ?? 'Déconnexion'),
                                content: Text(localizations?.translate('logout_confirm') ?? 'Êtes-vous sûr de vouloir vous déconnecter ?'),
                                actions: [
                                  TextButton(
                                    onPressed: () => Navigator.pop(context, false),
                                    child: Text(localizations?.translate('cancel') ?? 'Annuler'),
                                  ),
                                  TextButton(
                                    onPressed: () => Navigator.pop(context, true),
                                    child: Text(
                                      localizations?.translate('logout') ?? 'Déconnexion',
                                      style: TextStyle(color: Colors.red),
                                    ),
                                  ),
                                ],
                              ),
                            );
                            
                            if (confirm == true) {
                              await authProvider.logout();
                              Provider.of<AreasProvider>(context, listen: false).clear();
                              Provider.of<ServicesProvider>(context, listen: false).clear();
                              
                              Navigator.of(context).pushReplacement(
                                MaterialPageRoute(builder: (_) => LoginScreen()),
                              );
                            }
                          },
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatItem(BuildContext context, String title, String value, IconData icon, Color color) {
    return Container(
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 32),
          SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          SizedBox(height: 4),
          Text(
            title,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
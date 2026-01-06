import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/areas_provider.dart';
import '../../providers/services_provider.dart';
import '../auth/login_screen.dart';
import '../info/about_screen.dart';

class ProfileScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Profile'),
        automaticallyImplyLeading: false,
      ),
      body: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          final user = authProvider.user;
          
          if (user == null) {
            return Center(child: Text('Not logged in'));
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
                          backgroundColor: Color(0xFF0A4A0E),
                          child: Text(
                            user.displayName != null && user.displayName!.isNotEmpty
                                ? user.displayName![0].toUpperCase()
                                : user.email[0].toUpperCase(),
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                        SizedBox(height: 16),
                        Text(
                          user.displayName ?? 'User',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey[800],
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          user.email,
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 16,
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
                              user.isVerified ? 'Verified' : 'Unverified',
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
                              'Statistics',
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
                                    'Total Areas',
                                    '${areasProvider.areas.length}',
                                    Icons.wb_auto,
                                    Colors.blue,
                                  ),
                                ),
                                Expanded(
                                  child: _buildStatItem(
                                    'Active Areas',
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
                          'Actions',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey[800],
                          ),
                        ),
                        SizedBox(height: 16),
                        ListTile(
                          leading: Icon(Icons.refresh, color: Color(0xFF0A4A0E)),
                          title: Text('Refresh Data'),
                          subtitle: Text('Reload areas and services'),
                          onTap: () async {
                            final areasProvider = Provider.of<AreasProvider>(context, listen: false);
                            final servicesProvider = Provider.of<ServicesProvider>(context, listen: false);
                            await Future.wait([
                              areasProvider.fetchAreas(),
                              servicesProvider.fetchServices(),
                            ]);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Data refreshed')),
                            );
                          },
                        ),
                        Divider(),
                        ListTile(
                          leading: Icon(Icons.info, color: Color(0xFF0A4A0E)),
                          title: Text('About'),
                          subtitle: Text('Learn more about AREA'),
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => AboutScreen()),
                            );
                          },
                        ),
                        Divider(),
                        ListTile(
                          leading: Icon(Icons.logout, color: Colors.red[600]),
                          title: Text('Logout'),
                          subtitle: Text('Sign out of your account'),
                          onTap: () async {
                            final confirm = await showDialog<bool>(
                              context: context,
                              builder: (context) => AlertDialog(
                                title: Text('Logout'),
                                content: Text('Are you sure you want to logout?'),
                                actions: [
                                  TextButton(
                                    onPressed: () => Navigator.pop(context, false),
                                    child: Text('Cancel'),
                                  ),
                                  TextButton(
                                    onPressed: () => Navigator.pop(context, true),
                                    child: Text(
                                      'Logout',
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

  Widget _buildStatItem(String title, String value, IconData icon, Color color) {
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
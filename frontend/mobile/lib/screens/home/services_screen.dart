import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/services_provider.dart';
import '../../data/mock_services.dart';

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

  bool _isServiceConnected(String serviceName, ServicesProvider provider) {
    // Check if service is connected via backend userServices
    final service = provider.services.where((s) => s.name.toLowerCase() == serviceName.toLowerCase()).firstOrNull;
    if (service == null) return false;
    
    return provider.userServices.any((us) => us.serviceId == service.id);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Consumer<ServicesProvider>(
        builder: (context, servicesProvider, child) {
          return SingleChildScrollView(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Services',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w600,
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
                SizedBox(height: 24),
                
                // Spotify Card
                _buildSpotifyCard(servicesProvider),
                SizedBox(height: 12),
                
                // Twitch Card
                _buildTwitchCard(),
                SizedBox(height: 24),
                
                // Mock Services Grid
                GridView.builder(
                  shrinkWrap: true,
                  physics: NeverScrollableScrollPhysics(),
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 1,
                    childAspectRatio: 1.2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                  ),
                  itemCount: MOCK_SERVICES.length,
                  itemBuilder: (context, index) {
                    final service = MOCK_SERVICES[index];
                    return _buildMockServiceCard(service);
                  },
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildSpotifyCard(ServicesProvider provider) {
    final spotifyUserService = provider.spotifyUserService;
    final isConnected = spotifyUserService != null;
    
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(color: Color(0xFFE5E3DD)),
      ),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Spotify',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF1A1A18),
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        isConnected
                            ? 'Connecté : ${spotifyUserService.displayName ?? 'Compte Spotify'}'
                            : 'Non connecté',
                        style: TextStyle(
                          fontSize: 13,
                          color: Color(0xFF6B6962),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: 12),
            Row(
              children: [
                _buildBadge(
                  isConnected ? 'Connecté' : 'Non connecté',
                  isConnected ? Color(0xff0a4a0e) : Colors.grey,
                ),
                SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton(
                    onPressed: provider.spotifyLoading
                        ? null
                        : () => provider.handleConnectSpotify(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isConnected ? Colors.white : Color(0xff0a4a0e),
                      foregroundColor: isConnected ? Color(0xff0a4a0e) : Colors.white,
                      elevation: 0,
                      side: isConnected ? BorderSide(color: Color(0xFFE5E3DD)) : null,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(6),
                      ),
                      padding: EdgeInsets.symmetric(vertical: 10),
                    ),
                    child: Text(
                      provider.spotifyLoading
                          ? 'Chargement...'
                          : (isConnected ? 'Reconnecter' : 'Connecter'),
                      style: TextStyle(fontSize: 13),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTwitchCard() {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(color: Color(0xFFE5E3DD)),
      ),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Twitch',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF1A1A18),
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Aucune connexion requise',
                        style: TextStyle(
                          fontSize: 13,
                          color: Color(0xFF6B6962),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: 12),
            Row(
              children: [
                _buildBadge('Disponible', Color(0xff0a4a0e)),
                SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton(
                    onPressed: null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: Color(0xff0a4a0e),
                      elevation: 0,
                      side: BorderSide(color: Color(0xFFE5E3DD)),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(6),
                      ),
                      padding: EdgeInsets.symmetric(vertical: 10),
                      disabledBackgroundColor: Colors.white,
                      disabledForegroundColor: Color(0xff0a4a0e),
                    ),
                    child: Text('Connecté', style: TextStyle(fontSize: 13)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMockServiceCard(MockService service) {
    return Consumer<ServicesProvider>(
      builder: (context, provider, child) {
        final isConnected = _isServiceConnected(service.name, provider);
        
        return Card(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: BorderSide(color: Color(0xFFE5E3DD)),
          ),
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: Color(0xFFF5F4F0),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(Icons.apps, color: Color(0xFF1A1A18), size: 24),
                    ),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            service.name,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF1A1A18),
                            ),
                          ),
                          SizedBox(height: 4),
                          _buildBadge(getCategoryLabel(service.category), Colors.grey, small: true),
                        ],
                      ),
                    ),
                    _buildBadge(
                      isConnected ? 'Connecté' : 'Non connecté',
                      isConnected ? Color(0xff0a4a0e) : Colors.grey,
                      small: true,
                    ),
                  ],
                ),
                SizedBox(height: 12),
                Text(
                  service.description,
                  style: TextStyle(
                    fontSize: 13,
                    color: Color(0xFF6B6962),
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                SizedBox(height: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'ACTIONS (${service.actions.length})',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF8B8980),
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      service.actions.map((a) => a.name).join(', ').isEmpty
                          ? 'Aucune'
                          : service.actions.map((a) => a.name).join(', '),
                      style: TextStyle(
                        fontSize: 13,
                        color: Color(0xFF4D4C47),
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
                SizedBox(height: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'REACTIONS (${service.reactions.length})',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF8B8980),
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      service.reactions.map((r) => r.name).join(', ').isEmpty
                          ? 'Aucune'
                          : service.reactions.map((r) => r.name).join(', '),
                      style: TextStyle(
                        fontSize: 13,
                        color: Color(0xFF4D4C47),
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
                SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: null, // Mock services don't have real connect/disconnect
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isConnected ? Colors.white : Color(0xff0a4a0e),
                      foregroundColor: isConnected ? Color(0xff0a4a0e) : Colors.white,
                      elevation: 0,
                      side: isConnected ? BorderSide(color: Color(0xFFE5E3DD)) : null,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(6),
                      ),
                      padding: EdgeInsets.symmetric(vertical: 10),
                      disabledBackgroundColor: isConnected ? Colors.white : Color(0xff0a4a0e),
                      disabledForegroundColor: isConnected ? Color(0xff0a4a0e) : Colors.white,
                    ),
                    child: Text(
                      isConnected ? 'Connecté' : 'Non disponible',
                      style: TextStyle(fontSize: 13),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildBadge(String label, Color color, {bool small = false}) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: small ? 8 : 10,
        vertical: small ? 4 : 6,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: small ? 11 : 12,
          fontWeight: FontWeight.w500,
          color: color.withOpacity(0.8),
        ),
      ),
    );
  }
}
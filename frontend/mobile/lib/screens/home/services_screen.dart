import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/services_provider.dart';
import '../../data/mock_services.dart';

class ServicesScreen extends StatefulWidget {
  @override
  _ServicesScreenState createState() => _ServicesScreenState();
}

class _ServicesScreenState extends State<ServicesScreen> {
  final Map<String, bool> _mockServiceConnections = {
    '1': false, // Gmail
    '2': true,  // GitHub
    '3': false, // Discord
    '4': false, // GoogleDrive
    '5': true,  // Twitch
    '6': true,  // Spotify
  };

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ServicesProvider>(context, listen: false).fetchServices();
    });
  }

  void _toggleConnection(String serviceId) {
    setState(() {
      _mockServiceConnections[serviceId] = !(_mockServiceConnections[serviceId] ?? false);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text('Services', style: TextStyle(color: Color(0xFF1A1A18))),
        backgroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
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
                  isConnected ? Colors.green : Colors.grey,
                ),
                SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton(
                    onPressed: provider.spotifyLoading
                        ? null
                        : () => provider.handleConnectSpotify(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isConnected ? Colors.white : Color(0xFF1A1A18),
                      foregroundColor: isConnected ? Color(0xFF1A1A18) : Colors.white,
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
                _buildBadge('Disponible', Colors.green),
                SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton(
                    onPressed: null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: Color(0xFF1A1A18),
                      elevation: 0,
                      side: BorderSide(color: Color(0xFFE5E3DD)),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(6),
                      ),
                      padding: EdgeInsets.symmetric(vertical: 10),
                      disabledBackgroundColor: Colors.white,
                      disabledForegroundColor: Color(0xFF1A1A18),
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
    final isConnected = _mockServiceConnections[service.id] ?? service.isConnected;
    
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
                  isConnected ? Colors.green : Colors.grey,
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
                onPressed: () => _toggleConnection(service.id),
                style: ElevatedButton.styleFrom(
                  backgroundColor: isConnected ? Colors.white : Color(0xFF1A1A18),
                  foregroundColor: isConnected ? Color(0xFF1A1A18) : Colors.white,
                  elevation: 0,
                  side: isConnected ? BorderSide(color: Color(0xFFE5E3DD)) : null,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(6),
                  ),
                  padding: EdgeInsets.symmetric(vertical: 10),
                ),
                child: Text(
                  isConnected ? 'Déconnecter' : 'Connecter',
                  style: TextStyle(fontSize: 13),
                ),
              ),
            ),
          ],
        ),
      ),
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
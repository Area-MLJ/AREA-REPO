import 'package:flutter/material.dart';
import 'auth/login_screen.dart';
import 'auth/register_screen.dart';

class WelcomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFE8E6E1),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: EdgeInsets.all(16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(height: 40),
                // Title
                Text(
                  'ACTION-REACTION',
                  style: TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.bold,
                    color: Color(0xff0a4a0e),
                  ),
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: 16),
                // Subtitle
                Text(
                  'Automatisez vos tâches en connectant vos services préférés',
                  style: TextStyle(
                    fontSize: 20,
                    color: Color(0xFF6B6962),
                  ),
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: 12),
                Text(
                  'Créez des automatisations intelligentes : quand une action se produit, déclenchez une réaction',
                  style: TextStyle(
                    fontSize: 18,
                    color: Color(0xFF6B6962),
                  ),
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: 48),
                
                // Create account button
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => RegisterScreen()),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Color(0xff0a4a0e),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      elevation: 0,
                    ),
                    child: Text(
                      'Créer un compte',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
                SizedBox(height: 16),
                
                // Login button
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: OutlinedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => LoginScreen()),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Color(0xff0a4a0e),
                      side: BorderSide(color: Color(0xff0a4a0e), width: 2),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: Text(
                      'Se connecter',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
                SizedBox(height: 48),
                
                // Feature cards
                Row(
                  children: [
                    Expanded(
                      child: _buildFeatureCard(
                        '🔗',
                        'Connectez',
                        'Gmail, GitHub, Discord et plus encore',
                      ),
                    ),
                    SizedBox(width: 12),
                    Expanded(
                      child: _buildFeatureCard(
                        '⚡',
                        'Automatisez',
                        'Créez des workflows intelligents',
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 12),
                _buildFeatureCard(
                  '🚀',
                  'Optimisez',
                  'Gagnez du temps sur vos tâches',
                ),
                SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFeatureCard(String emoji, String title, String description) {
    return Container(
      padding: EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.5),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Text(
            emoji,
            style: TextStyle(fontSize: 40),
          ),
          SizedBox(height: 12),
          Text(
            title,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Color(0xff0a4a0e),
            ),
          ),
          SizedBox(height: 8),
          Text(
            description,
            style: TextStyle(
              fontSize: 14,
              color: Color(0xFF6B6962),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

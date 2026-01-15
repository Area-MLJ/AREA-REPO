import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/areas_provider.dart';
import 'providers/services_provider.dart';
import 'screens/splash_screen.dart';

void main() => runApp(AreaApp());

class AreaApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => AreasProvider()),
        ChangeNotifierProvider(create: (_) => ServicesProvider()),
      ],
      child: MaterialApp(
        title: 'AREA',
        theme: ThemeData(
          primarySwatch: MaterialColor(0xFF0A4A0E, {
            50: Color(0xFFE8F5E8),
            100: Color(0xFFC6E6C7),
            200: Color(0xFFA0D5A3),
            300: Color(0xFF7AC47E),
            400: Color(0xFF5EB762),
            500: Color(0xFF0A4A0E),
            600: Color(0xFF094209),
            700: Color(0xFF083A08),
            800: Color(0xFF073207),
            900: Color(0xFF052A05),
          }),
          primaryColor: Color(0xFF0A4A0E),
          colorScheme: ColorScheme.fromSeed(
            seedColor: Color(0xFF0A4A0E),
            primary: Color(0xFF0A4A0E),
          ),
          scaffoldBackgroundColor: Colors.grey[50],
          appBarTheme: AppBarTheme(
            backgroundColor: Color(0xFF0A4A0E),
            foregroundColor: Colors.white,
            elevation: 0,
          ),
        ),
        home: SplashScreen(),
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}

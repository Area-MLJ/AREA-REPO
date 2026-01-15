import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('Simple widget test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Center(
            child: Text('AREA Mobile'),
          ),
        ),
      ),
    );

    // Verify that our app loads with AREA Mobile text
    expect(find.text('AREA Mobile'), findsOneWidget);
  });
}

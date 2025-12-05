import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:area/main.dart';

void main() {
  testWidgets('Add todo', (WidgetTester tester) async {
    await tester.pumpWidget(const MyApp());

    // Initially empty
    expect(find.byKey(const Key('emptyText')), findsOneWidget);

    // Enter text and add
    await tester.enterText(find.byKey(const Key('addField')), 'Buy milk');
    await tester.tap(find.byKey(const Key('addButton')));
    await tester.pumpAndSettle();

    expect(find.text('Buy milk'), findsOneWidget);
    expect(find.byKey(const ValueKey('tile-0')), findsOneWidget);
  });

  testWidgets('Toggle todo checkbox', (WidgetTester tester) async {
    await tester.pumpWidget(const MyApp());

    await tester.enterText(find.byKey(const Key('addField')), 'Walk dog');
    await tester.tap(find.byKey(const Key('addButton')));
    await tester.pumpAndSettle();

    final tileFinder = find.byKey(const ValueKey('tile-0'));
    expect(tileFinder, findsOneWidget);

    final checkboxFinder = find.descendant(of: tileFinder, matching: find.byType(Checkbox));
    expect(checkboxFinder, findsOneWidget);

    // Initially unchecked
    Checkbox checkbox = tester.widget<Checkbox>(checkboxFinder);
    expect(checkbox.value, isFalse);

    await tester.tap(checkboxFinder);
    await tester.pumpAndSettle();

    checkbox = tester.widget<Checkbox>(checkboxFinder);
    expect(checkbox.value, isTrue);
  });

  testWidgets('Dismiss todo to delete', (WidgetTester tester) async {
    await tester.pumpWidget(const MyApp());

    await tester.enterText(find.byKey(const Key('addField')), 'Do laundry');
    await tester.tap(find.byKey(const Key('addButton')));
    await tester.pumpAndSettle();

    final dismissible = find.byKey(const ValueKey('todo-0'));
    expect(dismissible, findsOneWidget);

    await tester.drag(dismissible, const Offset(-500.0, 0.0));
    await tester.pumpAndSettle();

    expect(find.text('Do laundry'), findsNothing);
  });
}

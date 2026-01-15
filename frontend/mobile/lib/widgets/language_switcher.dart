import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/locale_provider.dart';
import '../l10n/app_localizations.dart';

class Language {
  final String code;
  final String? countryCode;
  final String name;
  final String nativeName;

  Language({
    required this.code,
    this.countryCode,
    required this.name,
    required this.nativeName,
  });

  Locale get locale => countryCode != null 
      ? Locale(code, countryCode)
      : Locale(code);
}

final List<Language> languages = [
  Language(code: 'fr', name: 'French', nativeName: 'Français'),
  Language(code: 'en', name: 'English', nativeName: 'English'),
  Language(code: 'es', name: 'Spanish', nativeName: 'Español'),
  Language(code: 'it', name: 'Italian', nativeName: 'Italiano'),
  Language(code: 'de', name: 'German', nativeName: 'Deutsch'),
  Language(code: 'zh', countryCode: 'CN', name: 'Chinese (Simplified)', nativeName: '简体中文'),
  Language(code: 'zh', countryCode: 'TW', name: 'Chinese (Traditional)', nativeName: '繁體中文'),
];

class LanguageSwitcher extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<LocaleProvider>(
      builder: (context, localeProvider, child) {
        final currentLocale = localeProvider.locale;
        final currentLanguage = languages.firstWhere(
          (lang) => lang.locale == currentLocale,
          orElse: () => languages[0],
        );

        return ListTile(
          leading: Icon(Icons.language, color: Color(0xff0a4a0e)),
          title: Text(AppLocalizations.of(context)?.translate('language') ?? 'Language'),
          subtitle: Text(currentLanguage.nativeName),
          trailing: Icon(Icons.chevron_right),
          onTap: () => _showLanguageDialog(context, localeProvider, currentLocale),
        );
      },
    );
  }

  void _showLanguageDialog(BuildContext context, LocaleProvider localeProvider, Locale currentLocale) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(AppLocalizations.of(context)?.translate('select_language') ?? 'Select language'),
        contentPadding: EdgeInsets.symmetric(vertical: 16),
        content: Container(
          width: double.maxFinite,
          child: ListView.builder(
            shrinkWrap: true,
            itemCount: languages.length,
            itemBuilder: (context, index) {
              final language = languages[index];
              final isSelected = language.locale == currentLocale;

              return ListTile(
                title: Text(language.nativeName),
                subtitle: Text(language.name, style: TextStyle(fontSize: 12)),
                trailing: isSelected 
                    ? Icon(Icons.check, color: Color(0xff0a4a0e))
                    : null,
                selected: isSelected,
                selectedTileColor: Color(0xff0a4a0e).withOpacity(0.1),
                onTap: () {
                  localeProvider.setLocale(language.locale);
                  Navigator.of(context).pop();
                },
              );
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(AppLocalizations.of(context)?.translate('close') ?? 'Close'),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';

class AppLocalizations {
  final Locale locale;

  AppLocalizations(this.locale);

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  static const List<Locale> supportedLocales = [
    Locale('fr'),
    Locale('en'),
    Locale('es'),
    Locale('it'),
    Locale('de'),
    Locale('zh', 'CN'),
    Locale('zh', 'TW'),
  ];

  static final Map<String, Map<String, String>> _localizedValues = {
    'fr': {
      // Common
      'save': 'Enregistrer',
      'cancel': 'Annuler',
      'delete': 'Supprimer',
      'edit': 'Modifier',
      'loading': 'Chargement...',
      'error': 'Erreur',
      'success': 'Succès',
      'close': 'Fermer',
      'back': 'Retour',
      'next': 'Suivant',
      'confirm': 'Confirmer',
      'search': 'Rechercher',
      'create': 'Créer',
      'update': 'Mettre à jour',
      'activate': 'Activer',
      'deactivate': 'Désactiver',
      
      // Navigation
      'nav_areas': 'AREAs',
      'nav_services': 'Services',
      'nav_profile': 'Profil',
      
      // Auth
      'login_title': 'ACTION-REACTION',
      'login_subtitle': 'Connectez-vous à votre compte',
      'email': 'Email',
      'password': 'Mot de passe',
      'login_button': 'Se connecter',
      'no_account': 'Pas de compte ?',
      'create_account': 'Créer un compte',
      'signup_title': 'Créer votre compte',
      'display_name': 'Nom d\'affichage',
      'confirm_password': 'Confirmer le mot de passe',
      'signup_button': 'Créer un compte',
      'has_account': 'Déjà un compte ?',
      
      // Profile
      'profile_title': 'Profil',
      'not_connected': 'Non connecté',
      'manage_info': 'Gérez vos informations personnelles',
      'verified': 'Vérifié',
      'unverified': 'Non vérifié',
      'statistics': 'Statistiques',
      'total_areas': 'Total AREAs',
      'active_areas': 'AREAs actives',
      'actions': 'Actions',
      'refresh_data': 'Actualiser les données',
      'refresh_subtitle': 'Recharger les AREAs et les services',
      'about': 'À propos',
      'about_subtitle': 'En savoir plus sur AREA',
      'logout': 'Déconnexion',
      'logout_subtitle': 'Se déconnecter de votre compte',
      'logout_confirm': 'Êtes-vous sûr de vouloir vous déconnecter ?',
      'data_refreshed': 'Données actualisées',
      
      // Services
      'services_title': 'Services',
      'connected': 'Connecté',
      'not_connected_service': 'Non connecté',
      'connect': 'Connecter',
      'disconnect': 'Déconnecter',
      
      // Areas
      'areas_title': 'Mes AREAs',
      'create_area': 'Nouvelle AREA',
      'no_areas': 'Aucune AREA créée',
      'no_areas_desc': 'Commencez par créer votre première automatisation',
      'enabled': 'Activée',
      'disabled': 'Désactivée',
      'dashboard': 'Dashboard',
      'manage_automations': 'Gérez vos automatisations',
      'new_area_button': '+ Nouvelle AREA',
      'total': 'Total',
      'active': 'Actives',
      'inactive': 'Inactives',
      'my_areas': 'Mes AREAs',
      'created_on': 'Créée le',
      'builtin': 'Built-in',
      'configure': 'Configurer',
      'error_loading': 'Impossible de charger certaines données.',
      'automate_tasks': 'Automatisez vos tâches en connectant vos services préférés',
      'login_to_continue': 'Connectez-vous pour continuer',
      'enter_email': 'Veuillez entrer votre email',
      'enter_valid_email': 'Veuillez entrer un email valide',
      'enter_password': 'Veuillez entrer votre mot de passe',
      'no_account_question': 'Pas de compte ? ',
      'register': 'S\'inscrire',
      
      // Welcome
      'welcome_title': 'Bienvenue',
      'get_started': 'Commencer',
      
      // Language
      'language': 'Langue',
      'select_language': 'Sélectionner la langue',
    },
    'en': {
      // Common
      'save': 'Save',
      'cancel': 'Cancel',
      'delete': 'Delete',
      'edit': 'Edit',
      'loading': 'Loading...',
      'error': 'Error',
      'success': 'Success',
      'close': 'Close',
      'back': 'Back',
      'next': 'Next',
      'confirm': 'Confirm',
      'search': 'Search',
      'create': 'Create',
      'update': 'Update',
      'activate': 'Activate',
      'deactivate': 'Deactivate',
      
      // Navigation
      'nav_areas': 'AREAs',
      'nav_services': 'Services',
      'nav_profile': 'Profile',
      
      // Auth
      'login_title': 'ACTION-REACTION',
      'login_subtitle': 'Sign in to your account',
      'email': 'Email',
      'password': 'Password',
      'login_button': 'Sign in',
      'no_account': 'Don\'t have an account?',
      'create_account': 'Create an account',
      'signup_title': 'Create your account',
      'display_name': 'Display name',
      'confirm_password': 'Confirm password',
      'signup_button': 'Create account',
      'has_account': 'Already have an account?',
      
      // Profile
      'profile_title': 'Profile',
      'not_connected': 'Not connected',
      'manage_info': 'Manage your personal information',
      'verified': 'Verified',
      'unverified': 'Unverified',
      'statistics': 'Statistics',
      'total_areas': 'Total AREAs',
      'active_areas': 'Active AREAs',
      'actions': 'Actions',
      'refresh_data': 'Refresh data',
      'refresh_subtitle': 'Reload AREAs and services',
      'about': 'About',
      'about_subtitle': 'Learn more about AREA',
      'logout': 'Sign out',
      'logout_subtitle': 'Sign out from your account',
      'logout_confirm': 'Are you sure you want to sign out?',
      'data_refreshed': 'Data refreshed',
      
      // Services
      'services_title': 'Services',
      'connected': 'Connected',
      'not_connected_service': 'Not connected',
      'connect': 'Connect',
      'disconnect': 'Disconnect',
      
      // Areas
      'areas_title': 'My AREAs',
      'create_area': 'New AREA',
      'no_areas': 'No AREA created',
      'no_areas_desc': 'Start by creating your first automation',
      'enabled': 'Enabled',
      'disabled': 'Disabled',
      'dashboard': 'Dashboard',
      'manage_automations': 'Manage your automations',
      'new_area_button': '+ New AREA',
      'total': 'Total',
      'active': 'Active',
      'inactive': 'Inactive',
      'my_areas': 'My AREAs',
      'created_on': 'Created on',
      'builtin': 'Built-in',
      'configure': 'Configure',
      'error_loading': 'Unable to load some data.',
      'automate_tasks': 'Automate your tasks by connecting your favorite services',
      'login_to_continue': 'Sign in to continue',
      'enter_email': 'Please enter your email',
      'enter_valid_email': 'Please enter a valid email',
      'enter_password': 'Please enter your password',
      'no_account_question': 'Don\'t have an account? ',
      'register': 'Sign up',
      
      // Welcome
      'welcome_title': 'Welcome',
      'get_started': 'Get started',
      
      // Language
      'language': 'Language',
      'select_language': 'Select language',
    },
    'es': {
      // Common
      'save': 'Guardar',
      'cancel': 'Cancelar',
      'delete': 'Eliminar',
      'edit': 'Editar',
      'loading': 'Cargando...',
      'error': 'Error',
      'success': 'Éxito',
      'close': 'Cerrar',
      'back': 'Atrás',
      'next': 'Siguiente',
      'confirm': 'Confirmar',
      'search': 'Buscar',
      'create': 'Crear',
      'update': 'Actualizar',
      'activate': 'Activar',
      'deactivate': 'Desactivar',
      
      // Navigation
      'nav_areas': 'AREAs',
      'nav_services': 'Servicios',
      'nav_profile': 'Perfil',
      
      // Auth
      'login_title': 'ACTION-REACTION',
      'login_subtitle': 'Inicia sesión en tu cuenta',
      'email': 'Correo',
      'password': 'Contraseña',
      'login_button': 'Iniciar sesión',
      'no_account': '¿No tienes cuenta?',
      'create_account': 'Crear una cuenta',
      'signup_title': 'Crea tu cuenta',
      'display_name': 'Nombre de usuario',
      'confirm_password': 'Confirmar contraseña',
      'signup_button': 'Crear cuenta',
      'has_account': '¿Ya tienes una cuenta?',
      
      // Profile
      'profile_title': 'Perfil',
      'not_connected': 'No conectado',
      'manage_info': 'Gestiona tu información personal',
      'verified': 'Verificado',
      'unverified': 'No verificado',
      'statistics': 'Estadísticas',
      'total_areas': 'Total AREAs',
      'active_areas': 'AREAs activas',
      'actions': 'Acciones',
      'refresh_data': 'Actualizar datos',
      'refresh_subtitle': 'Recargar AREAs y servicios',
      'about': 'Acerca de',
      'about_subtitle': 'Más información sobre AREA',
      'logout': 'Cerrar sesión',
      'logout_subtitle': 'Cerrar sesión de tu cuenta',
      'logout_confirm': '¿Estás seguro de que quieres cerrar sesión?',
      'data_refreshed': 'Datos actualizados',
      
      // Services
      'services_title': 'Servicios',
      'connected': 'Conectado',
      'not_connected_service': 'No conectado',
      'connect': 'Conectar',
      'disconnect': 'Desconectar',
      
      // Areas
      'areas_title': 'Mis AREAs',
      'create_area': 'Nueva AREA',
      'no_areas': 'No hay AREAs creadas',
      'no_areas_desc': 'Comienza creando tu primera automatización',
      'enabled': 'Activada',
      'disabled': 'Desactivada',
      'dashboard': 'Dashboard',
      'manage_automations': 'Gestiona tus automatizaciones',
      'new_area_button': '+ Nueva AREA',
      'total': 'Total',
      'active': 'Activas',
      'inactive': 'Inactivas',
      'my_areas': 'Mis AREAs',
      'created_on': 'Creada el',
      'builtin': 'Integrada',
      'configure': 'Configurar',
      'error_loading': 'No se pueden cargar algunos datos.',
      'automate_tasks': 'Automatiza tus tareas conectando tus servicios favoritos',
      'login_to_continue': 'Inicia sesión para continuar',
      'enter_email': 'Por favor ingresa tu correo',
      'enter_valid_email': 'Por favor ingresa un correo válido',
      'enter_password': 'Por favor ingresa tu contraseña',
      'no_account_question': '¿No tienes cuenta? ',
      'register': 'Registrarse',
      
      // Welcome
      'welcome_title': 'Bienvenido',
      'get_started': 'Comenzar',
      
      // Language
      'language': 'Idioma',
      'select_language': 'Seleccionar idioma',
    },
    'it': {
      // Common
      'save': 'Salva',
      'cancel': 'Annulla',
      'delete': 'Elimina',
      'edit': 'Modifica',
      'loading': 'Caricamento...',
      'error': 'Errore',
      'success': 'Successo',
      'close': 'Chiudi',
      'back': 'Indietro',
      'next': 'Avanti',
      'confirm': 'Conferma',
      'search': 'Cerca',
      'create': 'Crea',
      'update': 'Aggiorna',
      'activate': 'Attiva',
      'deactivate': 'Disattiva',
      
      // Navigation
      'nav_areas': 'AREAs',
      'nav_services': 'Servizi',
      'nav_profile': 'Profilo',
      
      // Auth
      'login_title': 'ACTION-REACTION',
      'login_subtitle': 'Accedi al tuo account',
      'email': 'Email',
      'password': 'Password',
      'login_button': 'Accedi',
      'no_account': 'Non hai un account?',
      'create_account': 'Crea un account',
      'signup_title': 'Crea il tuo account',
      'display_name': 'Nome visualizzato',
      'confirm_password': 'Conferma password',
      'signup_button': 'Crea account',
      'has_account': 'Hai già un account?',
      
      // Profile
      'profile_title': 'Profilo',
      'not_connected': 'Non connesso',
      'manage_info': 'Gestisci le tue informazioni personali',
      'verified': 'Verificato',
      'unverified': 'Non verificato',
      'statistics': 'Statistiche',
      'total_areas': 'AREA totali',
      'active_areas': 'AREA attive',
      'actions': 'Azioni',
      'refresh_data': 'Aggiorna dati',
      'refresh_subtitle': 'Ricarica AREA e servizi',
      'about': 'Informazioni',
      'about_subtitle': 'Scopri di più su AREA',
      'logout': 'Esci',
      'logout_subtitle': 'Esci dal tuo account',
      'logout_confirm': 'Sei sicuro di voler uscire?',
      'data_refreshed': 'Dati aggiornati',
      
      // Services
      'services_title': 'Servizi',
      'connected': 'Connesso',
      'not_connected_service': 'Non connesso',
      'connect': 'Connetti',
      'disconnect': 'Disconnetti',
      
      // Areas
      'areas_title': 'Le mie AREA',
      'create_area': 'Nuova AREA',
      'no_areas': 'Nessuna AREA creata',
      'no_areas_desc': 'Inizia creando la tua prima automazione',
      'enabled': 'Abilitata',
      'disabled': 'Disabilitata',
      'dashboard': 'Dashboard',
      'manage_automations': 'Gestisci le tue automazioni',
      'new_area_button': '+ Nuova AREA',
      'total': 'Totale',
      'active': 'Attive',
      'inactive': 'Inattive',
      'my_areas': 'Le mie AREA',
      'created_on': 'Creata il',
      'builtin': 'Integrata',
      'configure': 'Configura',
      'error_loading': 'Impossibile caricare alcuni dati.',
      'automate_tasks': 'Automatizza le tue attività collegando i tuoi servizi preferiti',
      'login_to_continue': 'Accedi per continuare',
      'enter_email': 'Inserisci la tua email',
      'enter_valid_email': 'Inserisci un\'email valida',
      'enter_password': 'Inserisci la tua password',
      'no_account_question': 'Non hai un account? ',
      'register': 'Registrati',
      
      // Welcome
      'welcome_title': 'Benvenuto',
      'get_started': 'Inizia',
      
      // Language
      'language': 'Lingua',
      'select_language': 'Seleziona lingua',
    },
    'de': {
      // Common
      'save': 'Speichern',
      'cancel': 'Abbrechen',
      'delete': 'Löschen',
      'edit': 'Bearbeiten',
      'loading': 'Lädt...',
      'error': 'Fehler',
      'success': 'Erfolg',
      'close': 'Schließen',
      'back': 'Zurück',
      'next': 'Weiter',
      'confirm': 'Bestätigen',
      'search': 'Suchen',
      'create': 'Erstellen',
      'update': 'Aktualisieren',
      'activate': 'Aktivieren',
      'deactivate': 'Deaktivieren',
      
      // Navigation
      'nav_areas': 'AREAs',
      'nav_services': 'Dienste',
      'nav_profile': 'Profil',
      
      // Auth
      'login_title': 'ACTION-REACTION',
      'login_subtitle': 'Melden Sie sich bei Ihrem Konto an',
      'email': 'E-Mail',
      'password': 'Passwort',
      'login_button': 'Anmelden',
      'no_account': 'Noch kein Konto?',
      'create_account': 'Konto erstellen',
      'signup_title': 'Erstellen Sie Ihr Konto',
      'display_name': 'Anzeigename',
      'confirm_password': 'Passwort bestätigen',
      'signup_button': 'Konto erstellen',
      'has_account': 'Bereits ein Konto?',
      
      // Profile
      'profile_title': 'Profil',
      'not_connected': 'Nicht verbunden',
      'manage_info': 'Verwalten Sie Ihre persönlichen Informationen',
      'verified': 'Verifiziert',
      'unverified': 'Nicht verifiziert',
      'statistics': 'Statistiken',
      'total_areas': 'Gesamt AREAs',
      'active_areas': 'Aktive AREAs',
      'actions': 'Aktionen',
      'refresh_data': 'Daten aktualisieren',
      'refresh_subtitle': 'AREAs und Dienste neu laden',
      'about': 'Über',
      'about_subtitle': 'Mehr über AREA erfahren',
      'logout': 'Abmelden',
      'logout_subtitle': 'Von Ihrem Konto abmelden',
      'logout_confirm': 'Sind Sie sicher, dass Sie sich abmelden möchten?',
      'data_refreshed': 'Daten aktualisiert',
      
      // Services
      'services_title': 'Dienste',
      'connected': 'Verbunden',
      'not_connected_service': 'Nicht verbunden',
      'connect': 'Verbinden',
      'disconnect': 'Trennen',
      
      // Areas
      'areas_title': 'Meine AREAs',
      'create_area': 'Neue AREA',
      'no_areas': 'Keine AREA erstellt',
      'no_areas_desc': 'Beginnen Sie mit Ihrer ersten Automatisierung',
      'enabled': 'Aktiviert',
      'disabled': 'Deaktiviert',
      'dashboard': 'Dashboard',
      'manage_automations': 'Verwalten Sie Ihre Automatisierungen',
      'new_area_button': '+ Neue AREA',
      'total': 'Gesamt',
      'active': 'Aktiv',
      'inactive': 'Inaktiv',
      'my_areas': 'Meine AREAs',
      'created_on': 'Erstellt am',
      'builtin': 'Integriert',
      'configure': 'Konfigurieren',
      'error_loading': 'Einige Daten können nicht geladen werden.',
      'automate_tasks': 'Automatisieren Sie Ihre Aufgaben, indem Sie Ihre Lieblingsdienste verbinden',
      'login_to_continue': 'Anmelden um fortzufahren',
      'enter_email': 'Bitte geben Sie Ihre E-Mail ein',
      'enter_valid_email': 'Bitte geben Sie eine gültige E-Mail ein',
      'enter_password': 'Bitte geben Sie Ihr Passwort ein',
      'no_account_question': 'Noch kein Konto? ',
      'register': 'Registrieren',
      
      // Welcome
      'welcome_title': 'Willkommen',
      'get_started': 'Loslegen',
      
      // Language
      'language': 'Sprache',
      'select_language': 'Sprache wählen',
    },
    'zh_CN': {
      // Common
      'save': '保存',
      'cancel': '取消',
      'delete': '删除',
      'edit': '编辑',
      'loading': '加载中...',
      'error': '错误',
      'success': '成功',
      'close': '关闭',
      'back': '返回',
      'next': '下一步',
      'confirm': '确认',
      'search': '搜索',
      'create': '创建',
      'update': '更新',
      'activate': '激活',
      'deactivate': '停用',
      
      // Navigation
      'nav_areas': 'AREAs',
      'nav_services': '服务',
      'nav_profile': '个人资料',
      
      // Auth
      'login_title': 'ACTION-REACTION',
      'login_subtitle': '登录您的账户',
      'email': '邮箱',
      'password': '密码',
      'login_button': '登录',
      'no_account': '没有账户？',
      'create_account': '创建账户',
      'signup_title': '创建您的账户',
      'display_name': '显示名称',
      'confirm_password': '确认密码',
      'signup_button': '创建账户',
      'has_account': '已有账户？',
      
      // Profile
      'profile_title': '个人资料',
      'not_connected': '未连接',
      'manage_info': '管理您的个人信息',
      'verified': '已验证',
      'unverified': '未验证',
      'statistics': '统计',
      'total_areas': '总AREAs',
      'active_areas': '活跃AREAs',
      'actions': '操作',
      'refresh_data': '刷新数据',
      'refresh_subtitle': '重新加载AREAs和服务',
      'about': '关于',
      'about_subtitle': '了解更多关于AREA',
      'logout': '登出',
      'logout_subtitle': '从您的账户登出',
      'logout_confirm': '您确定要登出吗？',
      'data_refreshed': '数据已刷新',
      
      // Services
      'services_title': '服务',
      'connected': '已连接',
      'not_connected_service': '未连接',
      'connect': '连接',
      'disconnect': '断开',
      
      // Areas
      'areas_title': '我的AREAs',
      'create_area': '新建AREA',
      'no_areas': '未创建AREA',
      'no_areas_desc': '开始创建您的第一个自动化',
      'enabled': '已启用',
      'disabled': '已禁用',
      'dashboard': '控制面板',
      'manage_automations': '管理您的自动化',
      'new_area_button': '+ 新建AREA',
      'total': '总计',
      'active': '活跃',
      'inactive': '未活跃',
      'my_areas': '我的AREAs',
      'created_on': '创建于',
      'builtin': '内置',
      'configure': '配置',
      'error_loading': '无法加载某些数据。',
      'automate_tasks': '通过连接您喜欢的服务来自动化您的任务',
      'login_to_continue': '登录以继续',
      'enter_email': '请输入您的邮箱',
      'enter_valid_email': '请输入有效的邮箱',
      'enter_password': '请输入您的密码',
      'no_account_question': '没有账户？',
      'register': '注册',
      
      // Welcome
      'welcome_title': '欢迎',
      'get_started': '开始',
      
      // Language
      'language': '语言',
      'select_language': '选择语言',
    },
    'zh_TW': {
      // Common
      'save': '儲存',
      'cancel': '取消',
      'delete': '刪除',
      'edit': '編輯',
      'loading': '載入中...',
      'error': '錯誤',
      'success': '成功',
      'close': '關閉',
      'back': '返回',
      'next': '下一步',
      'confirm': '確認',
      'search': '搜尋',
      'create': '建立',
      'update': '更新',
      'activate': '啟用',
      'deactivate': '停用',
      
      // Navigation
      'nav_areas': 'AREAs',
      'nav_services': '服務',
      'nav_profile': '個人資料',
      
      // Auth
      'login_title': 'ACTION-REACTION',
      'login_subtitle': '登入您的帳戶',
      'email': '電子郵件',
      'password': '密碼',
      'login_button': '登入',
      'no_account': '沒有帳戶？',
      'create_account': '建立帳戶',
      'signup_title': '建立您的帳戶',
      'display_name': '顯示名稱',
      'confirm_password': '確認密碼',
      'signup_button': '建立帳戶',
      'has_account': '已有帳戶？',
      
      // Profile
      'profile_title': '個人資料',
      'not_connected': '未連接',
      'manage_info': '管理您的個人資訊',
      'verified': '已驗證',
      'unverified': '未驗證',
      'statistics': '統計',
      'total_areas': '總AREAs',
      'active_areas': '活躍AREAs',
      'actions': '操作',
      'refresh_data': '重新整理資料',
      'refresh_subtitle': '重新載入AREAs和服務',
      'about': '關於',
      'about_subtitle': '了解更多關於AREA',
      'logout': '登出',
      'logout_subtitle': '從您的帳戶登出',
      'logout_confirm': '您確定要登出嗎？',
      'data_refreshed': '資料已重新整理',
      
      // Services
      'services_title': '服務',
      'connected': '已連接',
      'not_connected_service': '未連接',
      'connect': '連接',
      'disconnect': '中斷連接',
      
      // Areas
      'areas_title': '我的AREAs',
      'create_area': '新增AREA',
      'no_areas': '未建立AREA',
      'no_areas_desc': '開始建立您的第一個自動化',
      'enabled': '已啟用',
      'disabled': '已停用',
      'dashboard': '控制面板',
      'manage_automations': '管理您的自動化',
      'new_area_button': '+ 新增AREA',
      'total': '總計',
      'active': '活躍',
      'inactive': '未活躍',
      'my_areas': '我的AREAs',
      'created_on': '建立於',
      'builtin': '內建',
      'configure': '配置',
      'error_loading': '無法載入某些資料。',
      'automate_tasks': '透過連接您喜愛的服務來自動化您的任務',
      'login_to_continue': '登入以繼續',
      'enter_email': '請輸入您的電子郵件',
      'enter_valid_email': '請輸入有效的電子郵件',
      'enter_password': '請輸入您的密碼',
      'no_account_question': '沒有帳戶？',
      'register': '註冊',
      
      // Welcome
      'welcome_title': '歡迎',
      'get_started': '開始',
      
      // Language
      'language': '語言',
      'select_language': '選擇語言',
    },
  };

  String translate(String key) {
    final languageCode = locale.countryCode != null 
        ? '${locale.languageCode}_${locale.countryCode}'
        : locale.languageCode;
    
    return _localizedValues[languageCode]?[key] ?? 
           _localizedValues[locale.languageCode]?[key] ?? 
           key;
  }
}

class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) {
    return AppLocalizations.supportedLocales.any((l) => 
      l.languageCode == locale.languageCode && 
      (l.countryCode == null || l.countryCode == locale.countryCode)
    );
  }

  @override
  Future<AppLocalizations> load(Locale locale) async {
    return AppLocalizations(locale);
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

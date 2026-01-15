class MockService {
  final String id;
  final String name;
  final String displayName;
  final String description;
  final String iconUrl;
  final String category;
  final bool isConnected;
  final List<MockServiceAction> actions;
  final List<MockServiceReaction> reactions;

  MockService({
    required this.id,
    required this.name,
    required this.displayName,
    required this.description,
    required this.iconUrl,
    required this.category,
    required this.isConnected,
    required this.actions,
    required this.reactions,
  });
}

class MockServiceAction {
  final String id;
  final String name;
  final String description;

  MockServiceAction({
    required this.id,
    required this.name,
    required this.description,
  });
}

class MockServiceReaction {
  final String id;
  final String name;
  final String description;

  MockServiceReaction({
    required this.id,
    required this.name,
    required this.description,
  });
}

final List<MockService> MOCK_SERVICES = [
  MockService(
    id: '1',
    name: 'Gmail',
    displayName: 'Gmail',
    description: 'Service de messagerie électronique de Google',
    iconUrl: '/icons/gmail.svg',
    category: 'communication',
    isConnected: false,
    actions: [
      MockServiceAction(
        id: '1',
        name: 'Nouveau email reçu',
        description: 'Déclenche quand un nouvel email est reçu',
      ),
      MockServiceAction(
        id: '2',
        name: 'Email avec pièce jointe',
        description: 'Déclenche quand un email avec pièce jointe est reçu',
      ),
    ],
    reactions: [
      MockServiceReaction(
        id: '1',
        name: 'Envoyer un email',
        description: 'Envoie un email à un destinataire',
      ),
      MockServiceReaction(
        id: '2',
        name: 'Transférer un email',
        description: 'Transfère un email à un autre destinataire',
      ),
    ],
  ),
  MockService(
    id: '2',
    name: 'GitHub',
    displayName: 'GitHub',
    description: 'Plateforme de développement collaboratif',
    iconUrl: '/icons/github.svg',
    category: 'productivity',
    isConnected: true,
    actions: [
      MockServiceAction(
        id: '3',
        name: 'Push sur repository',
        description: 'Déclenche lors d\'un push sur un repository',
      ),
      MockServiceAction(
        id: '4',
        name: 'Nouvelle issue créée',
        description: 'Déclenche lorsqu\'une issue est créée',
      ),
      MockServiceAction(
        id: '5',
        name: 'Pull request mergée',
        description: 'Déclenche lorsqu\'une pull request est mergée',
      ),
    ],
    reactions: [
      MockServiceReaction(
        id: '3',
        name: 'Créer une issue',
        description: 'Crée une issue sur un repository',
      ),
      MockServiceReaction(
        id: '4',
        name: 'Commenter une PR',
        description: 'Ajoute un commentaire à une pull request',
      ),
    ],
  ),
  MockService(
    id: '3',
    name: 'Discord',
    displayName: 'Discord',
    description: 'Plateforme de communication pour communautés',
    iconUrl: '/icons/discord.svg',
    category: 'social',
    isConnected: false,
    actions: [
      MockServiceAction(
        id: '6',
        name: 'Message reçu',
        description: 'Déclenche lorsqu\'un message est reçu',
      ),
      MockServiceAction(
        id: '7',
        name: 'Utilisateur rejoint un serveur',
        description: 'Déclenche lorsqu\'un utilisateur rejoint un serveur',
      ),
    ],
    reactions: [
      MockServiceReaction(
        id: '5',
        name: 'Envoyer un message',
        description: 'Envoie un message dans un channel',
      ),
      MockServiceReaction(
        id: '6',
        name: 'Créer un channel',
        description: 'Crée un nouveau channel',
      ),
    ],
  ),
  MockService(
    id: '4',
    name: 'GoogleDrive',
    displayName: 'Google Drive',
    description: 'Service de stockage cloud de Google',
    iconUrl: '/icons/gdrive.svg',
    category: 'storage',
    isConnected: false,
    actions: [
      MockServiceAction(
        id: '8',
        name: 'Fichier ajouté',
        description: 'Déclenche lorsqu\'un fichier est ajouté',
      ),
      MockServiceAction(
        id: '9',
        name: 'Fichier modifié',
        description: 'Déclenche lorsqu\'un fichier est modifié',
      ),
    ],
    reactions: [
      MockServiceReaction(
        id: '7',
        name: 'Créer un fichier',
        description: 'Crée un nouveau fichier',
      ),
      MockServiceReaction(
        id: '8',
        name: 'Partager un fichier',
        description: 'Partage un fichier avec un utilisateur',
      ),
    ],
  ),
  MockService(
    id: '5',
    name: 'Twitch',
    displayName: 'Twitch',
    description: 'Détecte quand un streamer passe en live',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/5968/5968819.png',
    category: 'social',
    isConnected: true,
    actions: [
      MockServiceAction(
        id: 'twitch_stream_online',
        name: 'Stream en live',
        description: 'Déclenche quand le streamer (user_login) passe en live',
      ),
    ],
    reactions: [],
  ),
  MockService(
    id: '6',
    name: 'Spotify',
    displayName: 'Spotify',
    description: 'Lance un morceau sur Spotify',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2111/2111624.png',
    category: 'social',
    isConnected: true,
    actions: [],
    reactions: [
      MockServiceReaction(
        id: 'spotify_play_track',
        name: 'Lancer un morceau',
        description: 'Lance un morceau Spotify via son URL',
      ),
    ],
  ),
];

final Map<String, String> categoryLabels = {
  'social': 'Réseaux sociaux',
  'productivity': 'Productivité',
  'storage': 'Stockage',
  'communication': 'Communication',
  'time': 'Temps',
};

String getCategoryLabel(String category) {
  return categoryLabels[category] ?? category;
}

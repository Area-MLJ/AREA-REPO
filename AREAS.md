# Spotify x Twitch — idées de nouvelles actions / réactions (features AREA)

Ce document liste des fonctionnalités **réalistes** à ajouter pour créer de nouvelles AREA basées sur Twitch et Spotify.

---

## Twitch (Helix + EventSub)

### Actions (triggers)

#### 1) `twitch.stream_offline` — quand un live se termine
- **Type**: Action
- **Implémentation**:
  - Polling (simple, similaire à `twitch.stream_online`)
  - ou EventSub `stream.offline` (meilleur)
- **Params**:
  - `user_login` (le streamer à surveiller)
- **Intérêt**:
  - déclencher une réaction Spotify quand un stream se termine

#### 2) `twitch.new_follower` — nouveau follow sur une chaîne
- **Type**: Action
- **Implémentation**: EventSub `channel.follow` recommandé
- **Params**:
  - `broadcaster_login` (la chaîne concernée)
- **Scopes / contraintes**:
  - OAuth Twitch côté broadcaster souvent nécessaire selon le niveau de détail / permissions
- **Intérêt**:
  - créer des automatisations “community events” (follow → musique / message / etc.)

#### 3) `twitch.channel_points_redeem` — redemption points de chaîne
- **Type**: Action
- **Implémentation**: EventSub `channel.channel_points_custom_reward_redemption.add`
- **Params**:
  - `broadcaster_login`
  - optionnel: `reward_title` (pour filtrer une récompense précise)
- **Scopes / contraintes**:
  - OAuth Twitch requis
- **Intérêt**:
  - “Play song”, “Skip song”, “Change volume” déclenchés par le chat

#### 4) `twitch.chat_message_contains` — message chat contenant un mot-clé
- **Type**: Action
- **Implémentation**:
  - EventSub `channel.chat.message` (ou IRC Twitch)
- **Params**:
  - `broadcaster_login`
  - `keyword` (ou `regex` si tu veux aller plus loin)
- **Scopes / contraintes**:
  - OAuth requis (selon implémentation)
- **Intérêt**:
  - commandes type `!song`, `!skip`, `!volume 50`

#### 5) `twitch.raid_received` — raid reçu
- **Type**: Action
- **Implémentation**: EventSub `channel.raid`
- **Params**:
  - `to_broadcaster_login` (ta chaîne)
- **Scopes / contraintes**:
  - OAuth requis selon la subscription
- **Intérêt**:
  - déclencher une playlist / message spécial lors d’un raid

---

### Réactions (effets)

#### 1) `twitch.send_chat_message` — envoyer un message dans le chat
- **Type**: Réaction
- **Implémentation**: Helix “Send Chat Message” (ou IRC)
- **Params**:
  - `broadcaster_login`
  - `message` (template possible, ex: “Now playing: {{track_name}}”)
- **Scopes / contraintes**:
  - OAuth Twitch + droits de chat (broadcaster/mod)
- **Intérêt**:
  - annoncer “Now Playing” depuis Spotify ou réagir à des events

#### 2) `twitch.create_clip` — créer un clip
- **Type**: Réaction
- **Implémentation**: Helix “Create Clip”
- **Params**:
  - `broadcaster_login`
- **Scopes / contraintes**:
  - OAuth requis
- **Intérêt**:
  - auto-clip sur event (raid/sub/reward)

#### 3) `twitch.run_commercial` — lancer une pub
- **Type**: Réaction
- **Implémentation**: Helix “Start Commercial”
- **Params**:
  - `broadcaster_login`
  - `duration` (durée pub)
- **Scopes / contraintes**:
  - OAuth requis
- **Intérêt**:
  - automatiser des pubs lors de pauses/break

---

## Spotify (Web API)

> Spotify n’a pas de webhooks “généraux” faciles. Les actions (triggers) sont donc souvent en **polling**.

### Actions (triggers)

#### 1) `spotify.track_changed` — le morceau actuel change
- **Type**: Action
- **Implémentation**: Polling “Currently Playing Track”
- **Params**:
  - optionnel: `device_id` (si tu veux cibler un device)
- **Scopes / contraintes**:
  - `user-read-currently-playing` (ou `user-read-playback-state`)
- **Intérêt**:
  - déclencher des réactions Twitch (chat) / logging / notifications

#### 2) `spotify.playback_started` / `spotify.playback_paused`
- **Type**: Action
- **Implémentation**: Polling playback state
- **Scopes / contraintes**:
  - `user-read-playback-state`
- **Intérêt**:
  - automatiser des choses selon play/pause

#### 3) `spotify.new_saved_track` — un morceau liké (saved)
- **Type**: Action
- **Implémentation**: Polling “Saved Tracks”
- **Scopes / contraintes**:
  - `user-library-read`
- **Intérêt**:
  - sync vers playlist / trigger vers Twitch, etc.

#### 4) `spotify.new_recently_played`
- **Type**: Action
- **Implémentation**: Polling “Recently Played”
- **Scopes / contraintes**:
  - `user-read-recently-played`
- **Intérêt**:
  - historiser/automatiser basé sur les tracks joués

---

### Réactions (effets)

#### 1) `spotify.pause_playback`
- **Type**: Réaction
- **Implémentation**: “Pause a User's Playback”
- **Params**:
  - optionnel: `device_id`
- **Scopes / contraintes**:
  - `user-modify-playback-state`
- **Intérêt**:
  - couper la musique selon event Twitch

#### 2) `spotify.next_track` / `spotify.previous_track`
- **Type**: Réaction
- **Implémentation**: “Skip To Next/Previous”
- **Scopes / contraintes**:
  - `user-modify-playback-state`
- **Intérêt**:
  - skip contrôlé par event Twitch (reward, chat command)

#### 3) `spotify.set_volume`
- **Type**: Réaction
- **Implémentation**: “Set Playback Volume”
- **Params**:
  - `volume_percent` (0–100)
  - optionnel: `device_id`
- **Scopes / contraintes**:
  - `user-modify-playback-state`
- **Intérêt**:
  - “raid → volume 80%”, “stream start → volume 20%”

#### 4) `spotify.add_to_queue`
- **Type**: Réaction
- **Implémentation**: “Add Item to Playback Queue”
- **Params**:
  - `track_uri` ou `track_url`
  - optionnel: `device_id`
- **Scopes / contraintes**:
  - `user-modify-playback-state`
- **Intérêt**:
  - ajouter un jingle / son à chaque follow/sub/raid

#### 5) `spotify.add_track_to_playlist`
- **Type**: Réaction
- **Implémentation**: “Add Items to Playlist”
- **Params**:
  - `playlist_id`
  - `track_uri` / `track_url`
- **Scopes / contraintes**:
  - `playlist-modify-public` ou `playlist-modify-private`
- **Intérêt**:
  - archiver les morceaux joués/likés dans une playlist “stream picks”

---

## Exemples d’AREA prêtes à être ajoutées

### Twitch → Spotify
1) **Quand `<streamer>` passe OFFLINE → pause Spotify**
- Action: `twitch.stream_offline(user_login)`
- Réaction: `spotify.pause_playback(device_id?)`

2) **Quand je reçois un RAID → lancer une playlist “hype”**
- Action: `twitch.raid_received(to_broadcaster_login)`
- Réaction: `spotify.play_track(track_url=<playlist|album|track>, device_id?)`

3) **Quand quelqu’un redeem “Play Song” → ajouter un track à la queue**
- Action: `twitch.channel_points_redeem(reward_title=...)`
- Réaction: `spotify.add_to_queue(track_url=...)`

### Spotify → Twitch
4) **Quand le track change → envoyer “Now playing …” dans le chat**
- Action: `spotify.track_changed`
- Réaction: `twitch.send_chat_message(message="Now playing: {{track_name}} - {{artist_name}}")`

5) **Quand Spotify est PAUSED → message “Break music stopped”**
- Action: `spotify.playback_paused`
- Réaction: `twitch.send_chat_message(...)`

### Spotify → Spotify
6) **Quand je like un morceau → l’ajouter à une playlist**
- Action: `spotify.new_saved_track`
- Réaction: `spotify.add_track_to_playlist(playlist_id, track)`

---
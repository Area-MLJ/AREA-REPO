import requests
import config

url = "https://api.twitch.tv/helix/channels/followed"

params = {
    "user_id": config.user_id,  # à remplacer, voir ci-dessous
}

headers = {
    "Client-Id": config.client_id,
    "Authorization": f"Bearer {config.twitch_access_token}",
}

response = requests.get(url, headers=headers, params=params)

print(response.text)
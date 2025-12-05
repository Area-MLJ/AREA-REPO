import requests
import config

url = "https://gmail.googleapis.com/gmail/v1/users/me/messages"

headers = {
    "Authorization": f"Bearer {config.access_token}",
}

response = requests.get(url, headers=headers)

print(response.text)

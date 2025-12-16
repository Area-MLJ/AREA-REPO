import requests
import json
import config

url = "https://id.twitch.tv/oauth2/token"

payload = json.dumps({
  "client_id": config.client_id,
  "client_secret": config.client_secret,
  "grant_type": "client_credentials"
})
headers = {
  'Content-Type': 'application/json'
}

response = requests.request("POST", url, headers=headers, data=payload)

print(response.text)

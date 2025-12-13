import requests

username = "crushonyou2"
url = f"https://api.github.com/users/crushonyou2/repos"

response = requests.get(url)
repos = response.json()

for repo in repos:
    print(f"- {repo['name']}: {repo['description'] or 'No description'}")

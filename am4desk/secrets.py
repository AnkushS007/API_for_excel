import keyring

SERVICE = "AM4 Rapid Growth Assistant"
USERNAME = "official-api-key"

def get_api_key():
    key = keyring.get_password(SERVICE, USERNAME)
    if not key:
        raise RuntimeError("No API key is stored. Run: python -m am4desk.set_api_key")
    return key

def set_api_key(key):
    if not key or not key.strip():
        raise ValueError("API key cannot be empty.")
    keyring.set_password(SERVICE, USERNAME, key.strip())

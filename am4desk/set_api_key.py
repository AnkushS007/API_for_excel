from getpass import getpass
from .secrets import set_api_key

if __name__ == "__main__":
    print("The key is stored in Windows Credential Manager via the Python keyring package.")
    print("Do not paste it into GitHub, config files, chat, or screenshots.")
    set_api_key(getpass("Paste your official AM4 API key (input hidden): "))
    print("API key saved to the local credential store.")

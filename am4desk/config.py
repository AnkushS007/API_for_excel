from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "config" / "api.json"

def load_config():
    if not CONFIG_PATH.exists():
        example = ROOT / "config" / "api.example.json"
        raise FileNotFoundError(f"Create {CONFIG_PATH} from {example.name} and review the settings.")
    data = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    if not data.get("company"):
        raise ValueError("config/api.json must contain the AM4 company name.")
    return data

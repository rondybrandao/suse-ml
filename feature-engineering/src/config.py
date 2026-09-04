import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

BELEZA_ID = os.getenv("BELEZA_ID")

CREDENTIALS_PATH = os.getenv(
    "GOOGLE_APPLICATION_CREDENTIALS"
)

if not BELEZA_ID:
    raise ValueError("BELEZA_ID não configurado.")

if not CREDENTIALS_PATH:
    raise ValueError(
        "GOOGLE_APPLICATION_CREDENTIALS não configurado."
    )

CREDENTIALS_PATH = Path(CREDENTIALS_PATH)

if not CREDENTIALS_PATH.is_absolute():
    CREDENTIALS_PATH = BASE_DIR / CREDENTIALS_PATH

DATA_CORTE = os.getenv("DATA_CORTE")

if not DATA_CORTE:
    raise ValueError("DATA_CORTE não configurada.")

JANELA_CHURN_DIAS = int(
    os.getenv("JANELA_CHURN_DIAS", "90")
)

OUTPUT_DIR = BASE_DIR / "output"

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)
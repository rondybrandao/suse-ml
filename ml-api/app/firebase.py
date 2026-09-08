import firebase_admin

from firebase_admin import credentials
from firebase_admin import firestore

from pathlib import Path
import os
from dotenv import load_dotenv


load_dotenv()


BASE_DIR = Path(__file__).resolve().parent.parent

credentials_path = os.getenv(
    "GOOGLE_APPLICATION_CREDENTIALS"
)

credentials_path = BASE_DIR / credentials_path


if not firebase_admin._apps:

    cred = credentials.Certificate(
        str(credentials_path)
    )

    firebase_admin.initialize_app(cred)


db = firestore.client()
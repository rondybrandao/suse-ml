import firebase_admin

from firebase_admin import credentials
from firebase_admin import firestore

from config import CREDENTIALS_PATH


def iniciar_firebase():

    if not firebase_admin._apps:

        cred = credentials.Certificate(
            str(CREDENTIALS_PATH)
        )

        firebase_admin.initialize_app(cred)

    return firestore.client()
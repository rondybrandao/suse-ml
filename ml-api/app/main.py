from pathlib import Path

import joblib
import pandas as pd

from fastapi import FastAPI, HTTPException

from .schemas import ChurnRequest
from .features import (
    carregar_historico,
    construir_features
)

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = (
    BASE_DIR
    / "model"
    / "random_forest_churn.pkl"
)

artefato = joblib.load(
    MODEL_PATH
)

modelo = artefato["modelo"]

threshold = artefato["threshold"]

features = artefato["features"]

app = FastAPI(
    title="SUSE ML API",
    version="1.0.0"
)

@app.get("/")
def health_check():

    return {
        "status": "online",
        "servico": "SUSE ML API"
    }

@app.post("/predict")
def predict_churn(request: ChurnRequest):

    historico = carregar_historico(
        request.cliente_id
    )

    if not historico:

        raise HTTPException(
            status_code=404,
            detail="Cliente sem histórico"
        )

    dados_features = construir_features(historico)

    x = pd.DataFrame(
        [dados_features],
        columns=features
    )

    probabilidade = modelo.predict_proba(x)[0][1]

    churn = (probabilidade >= threshold)

    return {
        "cliente_id": request.cliente_id,
        "probabilidade_churn":
            round(
                float(probabilidade),
                4
            ),
        "threshold": threshold,
        "churn": bool(churn),
        "features": dados_features
    }
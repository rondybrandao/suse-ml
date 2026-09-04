from datetime import datetime, timedelta
from collections import Counter

import pandas as pd

from config import BELEZA_ID, DATA_CORTE, JANELA_CHURN_DIAS

def carregar_clientes(db):
    referencia = (
        db.collection("beleza")
        .document(BELEZA_ID)
        .collection("clientes")
    )

    documentos = referencia.stream()

    clientes = []

    for documento in documentos: 
        dados = documento.to_dict()
        dados["cliente_id"] = documento.id
        clientes.append(dados)
    return clientes

def carregar_historico(db, cliente_id):

    referencia = (
        db.collection("beleza")
        .document(BELEZA_ID)
        .collection("clientes")
        .document(cliente_id)
        .collection("historico")
    )

    documentos = referencia.stream()

    historico = []

    for documento in documentos:

        dados = documento.to_dict()

        dados["historico_id"] = documento.id

        historico.append(dados)

    return historico

def converter_data(valor):

    if valor is None:
        return None

    if hasattr(valor, "to_datetime"):
        return valor.to_datetime()

    if isinstance(valor, datetime):
        return valor

    if isinstance(valor, str):

        try:
            return datetime.fromisoformat(
                valor.replace("Z", "+00:00")
            )

        except ValueError:
            return None

    return None

def construir_features(cliente, historico):

    data_corte = datetime.fromisoformat(
        DATA_CORTE
    )

    eventos = []

    for registro in historico:

        data = converter_data(
            registro.get("date")
        )

        if data is None:
            continue

        if data <= data_corte:

            eventos.append({
                "data": data,
                "valor": float(
                    registro.get("valorTotal", 0) or 0
                ),
                "servicos": registro.get(
                    "servicos", []
                ),
                "profissional": registro.get(
                    "profissional"
                )
            })

    eventos.sort(
        key=lambda x: x["data"]
    )

    # ==========================================
    # FEATURE 1
    # ==========================================

    total_atendimentos = len(eventos)

    # ==========================================
    # FEATURE 2
    # ==========================================

    total_gasto = sum(
        evento["valor"]
        for evento in eventos
    )

    # ==========================================
    # FEATURE 3
    # ==========================================

    ticket_medio = (
        total_gasto / total_atendimentos
        if total_atendimentos > 0
        else 0
    )

    # ==========================================
    # FEATURE 4
    # ==========================================

    if eventos:

        ultimo_atendimento = eventos[-1]["data"]

        dias_desde_ultimo = (
            data_corte - ultimo_atendimento
        ).days

    else:

        ultimo_atendimento = None
        dias_desde_ultimo = -1

    # ==========================================
    # FEATURE 5
    # ==========================================

    intervalos = []

    for i in range(1, len(eventos)):

        intervalo = (
            eventos[i]["data"]
            - eventos[i - 1]["data"]
        ).days

        if intervalo >= 0:
            intervalos.append(intervalo)

    intervalo_medio = (
        sum(intervalos) / len(intervalos)
        if intervalos
        else 0
    )

    # ==========================================
    # FEATURE 6
    # ==========================================

    limite_30 = (
        data_corte - timedelta(days=30)
    )

    atendimentos_30d = sum(
        1
        for evento in eventos
        if evento["data"] >= limite_30
    )

    # ==========================================
    # FEATURE 7
    # ==========================================

    limite_90 = (
        data_corte - timedelta(days=90)
    )

    atendimentos_90d = sum(
        1
        for evento in eventos
        if evento["data"] >= limite_90
    )

    # ==========================================
    # FEATURE 8
    # ==========================================

    gasto_90d = sum(
        evento["valor"]
        for evento in eventos
        if evento["data"] >= limite_90
    )

    # ==========================================
    # FEATURE 9
    # ==========================================

    servicos = []

    for evento in eventos:

        servicos.extend(
            evento["servicos"]
        )

    quantidade_servicos_diferentes = len(
        set(servicos)
    )

    # ==========================================
    # FEATURE 10
    # ==========================================

    profissionais = [
        evento["profissional"]
        for evento in eventos
        if evento["profissional"]
    ]

    quantidade_profissionais_diferentes = len(
        set(profissionais)
    )

    return {
        "cliente_id": cliente["cliente_id"],
        "total_atendimentos": total_atendimentos,
        "total_gasto": round(total_gasto, 2),
        "ticket_medio": round(ticket_medio, 2),
        "dias_desde_ultimo_atendimento": dias_desde_ultimo,
        "intervalo_medio_atendimentos": round(
            intervalo_medio,
            2
        ),
        "atendimentos_30d": atendimentos_30d,
        "atendimentos_90d": atendimentos_90d,
        "gasto_90d": round(gasto_90d, 2),
        "quantidade_servicos_diferentes":
            quantidade_servicos_diferentes,
        "quantidade_profissionais_diferentes":
            quantidade_profissionais_diferentes
    }

def calcular_target_churn(
    db,
    cliente_id
):

    data_corte = datetime.fromisoformat(
        DATA_CORTE
    )

    data_limite = (
        data_corte
        + timedelta(days=JANELA_CHURN_DIAS)
    )

    historico = carregar_historico(
        db,
        cliente_id
    )

    for registro in historico:

        data = converter_data(
            registro.get("date")
        )

        if data is None:
            continue

        if (
            data_corte
            < data
            <= data_limite
        ):
            return 0

    return 1
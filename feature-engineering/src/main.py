import pandas as pd

from firebase import iniciar_firebase

from features import (
    carregar_clientes,
    carregar_historico,
    construir_features,
    calcular_target_churn
)

from config import OUTPUT_DIR


def main():

    print()
    print("=" * 60)
    print(" SUSE ML — FEATURE ENGINEERING")
    print("=" * 60)

    db = iniciar_firebase()

    print("\nCarregando clientes...")

    clientes = carregar_clientes(db)

    print(
        f"Clientes encontrados: {len(clientes)}"
    )

    dataset = []

    for i, cliente in enumerate(clientes, 1):

        cliente_id = cliente["cliente_id"]

        print(
            f"\rProcessando: {i}/{len(clientes)}",
            end=""
        )

        historico = carregar_historico(
            db,
            cliente_id
        )

        features = construir_features(
            cliente,
            historico
        )

        target = calcular_target_churn(
            db,
            cliente_id
        )

        features["target_churn"] = target

        dataset.append(features)

    print()

    df = pd.DataFrame(dataset)

    caminho = (
        OUTPUT_DIR
        / "dataset_churn.csv"
    )

    df.to_csv(
        caminho,
        index=False
    )

    print()
    print("Dataset criado com sucesso!")
    print()
    print(f"Linhas: {len(df)}")
    print(f"Colunas: {len(df.columns)}")
    print()
    print("Distribuição do target:")
    print(
        df["target_churn"]
        .value_counts()
    )
    print()
    print(f"Arquivo: {caminho}")


if __name__ == "__main__":
    main()
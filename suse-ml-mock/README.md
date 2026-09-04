# SUSE ML Mock Generator

Gerador de dados sintéticos para o projeto de Machine Learning do **SUSE Beleza**.

O objetivo é criar comportamento suficientemente realista para desenvolver:

- previsão de churn;
- segmentação de clientes;
- RFM;
- propensão de retorno;
- recomendação de serviços;
- análise de ticket;
- avaliação de campanhas CRM.

## 1. Por que este gerador existe?

O SUSE Beleza está em produção, mas ainda não possui clientes reais suficientes para construir o dataset de ML.

Em vez de inventar uma coluna `churn=true`, o gerador cria **histórico comportamental**. Depois, o pipeline de ML deve calcular o alvo.

Exemplo:

```text
DATA DE CORTE
      │
      ├── últimos 30/60/90/180 dias
      │       ↓
      │   FEATURES
      │
      └── próximos 90 dias
              ↓
       houve atendimento?
          │       │
         SIM     NÃO
          │       │
       churn=0  churn=1
```

Isso é importante porque evita vazamento do target para as features.

## 2. Estrutura

```text
suse-ml-mock/
├── src/
│   ├── config.ts
│   ├── types.ts
│   ├── utils.ts
│   ├── mock-firestore.ts
│   └── generators/
│       ├── cliente.generator.ts
│       ├── catalog.generator.ts
│       ├── os.generator.ts
│       ├── orcamento.generator.ts
│       ├── history.generator.ts
│       ├── crm.generator.ts
│       └── financial.generator.ts
├── credentials/
│   └── README.txt
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 3. Segurança

**Não rode contra sua unidade de produção.**

Crie uma unidade/beleza específica para testes, por exemplo:

```text
mock-ml-suse
```

O script exige `--confirmar` antes de escrever ou apagar dados.

Os documentos também recebem:

```text
mockData: true
mockSeed: <seed>
```

Assim é possível localizar os dados sintéticos.

## 4. Configuração

Copie:

```text
.env.example
```

para:

```text
.env
```

Configure:

```env
BELEZA_ID=mock-ml-suse
GOOGLE_APPLICATION_CREDENTIALS=./credentials/firebase-service-account.json
MOCK_SEED=20260902
MOCK_END_DATE=2026-09-01
```

Coloque a Service Account em:

```text
credentials/firebase-service-account.json
```

O arquivo está protegido pelo `.gitignore`.

## 5. Instalação

No terminal:

```powershell
npm install
```

## 6. Gerar dataset

Exemplo:

```powershell
npm run mock -- --clientes 1000 --meses 18 --confirmar
```

Ou um dataset menor:

```powershell
npm run mock -- --clientes 200 --meses 12 --confirmar
```

## 7. Limpar somente os dados MOCK

```powershell
npm run mock:clear -- --limpar --confirmar
```

A limpeza procura documentos que tenham:

```text
mockData == true
```

Ela não deve apagar documentos reais que não tenham essa marcação.

## 8. Comportamentos simulados

O gerador possui seis grupos comportamentais:

| Grupo | Comportamento |
|---|---|
| LOIAL | frequência alta, ticket maior e maior variedade |
| REGULAR | retornos relativamente previsíveis |
| OCASIONAL | intervalos maiores |
| EM_RISCO | frequência cai ao longo do tempo |
| CHURN | atende durante parte da história e depois reduz drasticamente |
| NOVO | entra mais tarde no histórico |

A coluna `mockCohort` existe para auditoria do gerador, mas **não deve ser usada como feature do modelo**.

## 9. Coleções geradas

### Clientes

```text
beleza/{belezaId}/clientes/{clienteId}
```

### Ordens de serviço

```text
beleza/{belezaId}/os/{osId}
```

Somente OS:

```text
status == FINALIZADO
```

devem ser tratadas como eventos concluídos de atendimento.

Isso evita contar orçamento e OS como dois atendimentos diferentes.

### Orçamentos

```text
beleza/{belezaId}/orcamentos/{orcamentoId}
```

### CRM

```text
beleza/{belezaId}/crm_followups/{followUpId}
```

### Histórico

```text
beleza/{belezaId}/clientes/{clienteId}/historico/{historicoId}
```

### Financeiro

```text
beleza/{belezaId}/lancamentos/{lancamentoId}
```

## 10. Features para o primeiro modelo

Depois da geração, o primeiro dataset de ML pode conter:

```text
cliente_id
total_atendimentos_90d
total_atendimentos_180d
total_gasto_90d
total_gasto_180d
ticket_medio
dias_desde_ultimo_atendimento
media_intervalo_dias
mediana_intervalo_dias
servicos_distintos
profissionais_distintos
valor_ultimo_atendimento
valor_medio_atendimento
atendimentos_30d
atendimentos_60d
atendimentos_90d
```

E o target:

```text
churn
```

Definição inicial:

```text
churn = 1
se o cliente não tiver nenhum atendimento FINALIZADO
nos 90 dias seguintes à data de corte.

churn = 0
caso contrário.
```

## 11. Exemplo de janela

Suponha:

```text
Data de corte: 2026-03-01
```

Features:

```text
2025-09-01 → 2026-03-01
```

Target:

```text
2026-03-02 → 2026-05-30
```

Isso cria uma separação temporal correta.

## 12. Por que usar seed?

Com:

```env
MOCK_SEED=20260902
```

a geração é determinística.

Isso permite reproduzir experimentos:

```text
dataset A
    ↓
RandomForest
    ↓
F1 = X

mesmo seed
    ↓
mesmo dataset
    ↓
novo experimento
```

Isso é muito útil para estudo de ML e engenharia de dados.

## 13. Próximo módulo do projeto

Depois deste gerador, a próxima etapa recomendada é:

```text
Firestore
   ↓
Extractor
   ↓
Feature Engineering
   ↓
Dataset supervisionado
   ↓
Train/Test temporal split
   ↓
Baseline
   ↓
Random Forest
   ↓
AdaBoost
   ↓
Gradient Boosting
   ↓
Avaliação
   ↓
Feature Importance
   ↓
Pipeline de inferência
```

O primeiro modelo pode ser **RandomForestClassifier**, que é especialmente útil neste estudo porque você já está trabalhando com árvores, ensemble, Bagging, AdaBoost e Gradient Boosting.

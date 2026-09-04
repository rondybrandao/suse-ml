import "dotenv/config";
import { createRequire } from "node:module";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import {
  FieldValue,
  getFirestore,
  Timestamp,
  type DocumentData,
  type Firestore
} from "firebase-admin/firestore";
import { CONFIG, hasFlag, parseArg } from "./config.js";
import { RNG, addDays, dateFromIso, daysBetween } from "./utils.js";
import { generateClients } from "./generators/cliente.generator.js";
import { generateOS } from "./generators/os.generator.js";
import { generateBudgets } from "./generators/orcamento.generator.js";
import { generateFollowUps } from "./generators/crm.generator.js";
import { generateHistory } from "./generators/history.generator.js";
import { generateFinancial } from "./generators/financial.generator.js";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";


const MOCK_FIELD = "mockData";
const MOCK_VALUE = true;

function initFirestore(): Firestore {
  if (getApps().length) {
    return getFirestore();
  }

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!credentialsPath) {
    throw new Error(
      "GOOGLE_APPLICATION_CREDENTIALS não foi configurado no arquivo .env"
    );
  }

  const absoluteCredentialsPath = path.isAbsolute(credentialsPath)
    ? credentialsPath
    : path.resolve(process.cwd(), credentialsPath);

  console.log(
    `Credencial Firebase: ${absoluteCredentialsPath}`
  );

  if (!existsSync(absoluteCredentialsPath)) {
    throw new Error(
      `Arquivo de credencial não encontrado:\n${absoluteCredentialsPath}`
    );
  }

  const serviceAccount = JSON.parse(
    readFileSync(absoluteCredentialsPath, "utf-8")
  );

  if (!serviceAccount.project_id) {
    throw new Error(
      "A credencial Firebase não possui o campo project_id."
    );
  }

  if (!serviceAccount.client_email) {
    throw new Error(
      "A credencial Firebase não possui o campo client_email."
    );
  }

  if (!serviceAccount.private_key) {
    throw new Error(
      "A credencial Firebase não possui o campo private_key."
    );
  }

  initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key.replace(/\\n/g, "\n")
    }),
    projectId: serviceAccount.project_id
  });

  console.log(
    `Firebase conectado ao projeto: ${serviceAccount.project_id}`
  );

  return getFirestore();
}

async function writeBatches(
  db: Firestore,
  entries: Array<{ path: string; data: DocumentData }>
): Promise<void> {
  for (let i = 0; i < entries.length; i += CONFIG.batchSize) {
    const chunk = entries.slice(i, i + CONFIG.batchSize);
    const batch = db.batch();

    for (const entry of chunk) {
      batch.set(db.doc(entry.path), entry.data, { merge: false });
    }

    await batch.commit();
    console.log(`  ✓ gravados ${Math.min(i + chunk.length, entries.length)}/${entries.length}`);
  }
}

async function clearMockData(db: Firestore, belezaId: string): Promise<void> {
  console.log(`\nLimpando documentos com ${MOCK_FIELD}=true em beleza/${belezaId}...`);

  const collections = [
    "clientes",
    "os",
    "orcamentos",
    "crm_followups",
    "historico",
    "lancamentos",
    "financeiro"
  ];

  let total = 0;

  for (const collection of collections) {
    const snap = await db.collection(`beleza/${belezaId}/${collection}`).where(MOCK_FIELD, "==", true).get();

    if (snap.empty) continue;

    const refs = snap.docs.map(d => d.ref);
    for (let i = 0; i < refs.length; i += CONFIG.batchSize) {
      const batch = db.batch();
      refs.slice(i, i + CONFIG.batchSize).forEach(ref => batch.delete(ref));
      await batch.commit();
    }

    total += refs.length;
    console.log(`  ✓ ${collection}: ${refs.length} removidos`);
  }

  console.log(`Total removido: ${total}`);
}

async function main(): Promise<void> {
  const clientesCount = Number(parseArg("--clientes", "1000"));
  const meses = Number(parseArg("--meses", "18"));
  const belezaId = process.env.BELEZA_ID || CONFIG.belezaId;
  const end = dateFromIso(process.env.MOCK_END_DATE || CONFIG.endDate);
  const start = addDays(end, -(meses * 30));

  if (!Number.isFinite(clientesCount) || clientesCount < 1) {
    throw new Error("--clientes deve ser um número maior que zero.");
  }

  if (!Number.isFinite(meses) || meses < 3) {
    throw new Error("--meses deve ser pelo menos 3 para permitir criação de labels de churn.");
  }

  if (hasFlag("--limpar")) {
    if (!hasFlag("--confirmar")) {
      throw new Error("Para limpar dados sintéticos use: --limpar --confirmar");
    }
    const db = initFirestore();
    await clearMockData(db, belezaId);
    return;
  }

  if (!hasFlag("--confirmar")) {
    throw new Error(
      "Proteção contra escrita acidental. Execute com --confirmar. " +
      "Exemplo: npm run mock -- --clientes 1000 --meses 18 --confirmar"
    );
  }

  console.log("\n=== SUSE ML — GERADOR DE DADOS SINTÉTICOS ===");
  console.log(`Beleza ID: ${belezaId}`);
  console.log(`Clientes: ${clientesCount}`);
  console.log(`Histórico: ${start.toISOString().slice(0, 10)} → ${end.toISOString().slice(0, 10)}`);
  console.log(`Seed: ${CONFIG.seed}`);

  const db = initFirestore();
  const rng = new RNG(CONFIG.seed);

  const clients = generateClients(rng, clientesCount, start, end);
  console.log(`\nClientes gerados: ${clients.length}`);

  const osList = generateOS(rng, clients, start, end);
  for (const os of osList) os.belezaId = belezaId;
  console.log(`OS geradas: ${osList.length}`);

  const budgets = generateBudgets(rng, osList);
  console.log(`Orçamentos gerados: ${budgets.length}`);

  const history = generateHistory(osList);
  console.log(`Históricos gerados: ${history.length}`);

  const followUps = generateFollowUps(rng, clients, osList, end);
  console.log(`CRM follow-ups gerados: ${followUps.length}`);

  const financial = generateFinancial(rng, osList);
  console.log(`Lançamentos financeiros gerados: ${financial.length}`);

  // Clientes
  const clientEntries = clients.map(c => ({
    path: `beleza/${belezaId}/clientes/${c.id}`,
    data: {
      id: c.id,
      nome: c.nome,
      telefone: c.telefone,
      email: c.email,
      nascimento: c.nascimento,
      cidade: c.cidade,
      uf: c.uf,
      userId: c.userId,
      mockCohort: c.mockCohort,
      joinedAt: c.joinedAt,
      [MOCK_FIELD]: MOCK_VALUE,
      mockSeed: CONFIG.seed
    }
  }));

  // OS — documento compatível com o núcleo do modelo existente.
  const osEntries = osList.map(os => ({
    path: `beleza/${belezaId}/os/${os.id}`,
    data: {
      id: os.id,
      numero: os.numero,
      belezaId: belezaId,
      cliente: {
        id: os.clienteId,
        nome: os.clienteNome,
        telefone: os.clienteTelefone
      },
      status: os.status,
      prioridade: os.prioridade,
      colaboradorId: os.colaboradorId,
      colaboradorNome: os.colaboradorNome,
      servicos: os.servicos,
      versaoOrcamentoAtual: 1,
      totais: os.totais,
      createdAt: os.createdAt,
      updatedAt: os.updatedAt,
      finalizadoEm: os.finalizadoEm,
      agendadoInicio: os.agendadoInicio,
      agendadoFim: os.agendadoFim,
      iniciadoEm: os.status === "FINALIZADO" ? os.createdAt : null,
      pausadoEm: null,
      pendencias: {
        aprovacao: false,
        assinatura: false,
        pagamento: os.status === "FINALIZADO" ? false : true
      },
      [MOCK_FIELD]: MOCK_VALUE,
      mockSeed: CONFIG.seed
    }
  }));

  // Orçamentos
  const budgetEntries = budgets.map(o => ({
    path: `beleza/${belezaId}/orcamentos/${o.id}`,
    data: {
      ...o,
      [MOCK_FIELD]: MOCK_VALUE,
      mockSeed: CONFIG.seed
    }
  }));

  // Histórico: tenta manter uma estrutura genérica e não duplica OS como evento de atendimento.
  const historyEntries = history.map(h => ({
    path: `beleza/${belezaId}/clientes/${osList.find(o => o.id === h.refs.osId)?.clienteId ?? "unknown"}/historico/${h.id}`,
    data: {
      ...h,
      [MOCK_FIELD]: MOCK_VALUE,
      mockSeed: CONFIG.seed
    }
  }));

  const crmEntries = followUps.map(f => ({
    path: `beleza/${belezaId}/crm_followups/${f.id}`,
    data: {
      ...f,
      [MOCK_FIELD]: MOCK_VALUE,
      mockSeed: CONFIG.seed
    }
  }));

  const financialEntries = financial.map(f => ({
    path: `beleza/${belezaId}/lancamentos/${String(f.id)}`,
    data: {
      ...f,
      [MOCK_FIELD]: MOCK_VALUE,
      mockSeed: CONFIG.seed
    }
  }));

  console.log("\nGravando clientes...");
  await writeBatches(db, clientEntries);

  console.log("\nGravando OS...");
  await writeBatches(db, osEntries);

  console.log("\nGravando orçamentos...");
  await writeBatches(db, budgetEntries);

  console.log("\nGravando históricos...");
  await writeBatches(db, historyEntries);

  console.log("\nGravando CRM...");
  await writeBatches(db, crmEntries);

  console.log("\nGravando financeiro...");
  await writeBatches(db, financialEntries);

  const finalizados = osList.filter(o => o.status === "FINALIZADO");
  const cancelados = osList.filter(o => o.status === "CANCELADO");

  console.log("\n=== RESUMO ===");
  console.log(`Clientes:       ${clients.length}`);
  console.log(`OS total:       ${osList.length}`);
  console.log(`OS finalizadas: ${finalizados.length}`);
  console.log(`OS canceladas:  ${cancelados.length}`);
  console.log(`Orçamentos:     ${budgets.length}`);
  console.log(`Históricos:     ${history.length}`);
  console.log(`CRM:            ${followUps.length}`);
  console.log(`Financeiro:     ${financial.length}`);

  console.log("\nPróximo passo recomendado:");
  console.log("1. Extrair somente eventos FINALIZADO.");
  console.log("2. Criar snapshots por cliente em uma data de corte.");
  console.log("3. Calcular features RFM/frequência/recência.");
  console.log("4. Criar churn=1 quando não houver atendimento nos 90 dias seguintes.");
  console.log("5. Treinar baseline LogisticRegression/RandomForest e avaliar precision, recall, F1 e ROC-AUC.");
}

main().catch(error => {
  console.error("\nERRO:", error instanceof Error ? error.message : error);
  process.exit(1);
});

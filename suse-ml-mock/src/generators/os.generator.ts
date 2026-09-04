import { MockClient, GeneratedOS, ServiceDef } from "../types.js";
import { PROFESSIONALS, SERVICES } from "./catalog.generator.js";
import { RNG, addDays, daysBetween, isoDateTime, money, randomDate, slugId } from "../utils.js";

function serviceChoices(rng: RNG, client: MockClient): ServiceDef[] {
  const base = rng.pick(SERVICES);
  const chosen = [base];

  const addProbability =
    client.mockCohort === "LOIAL" ? 0.55 :
    client.mockCohort === "REGULAR" ? 0.40 :
    client.mockCohort === "OCASIONAL" ? 0.25 : 0.30;

  if (rng.bool(addProbability)) {
    let second = rng.pick(SERVICES);
    while (second.id === base.id) second = rng.pick(SERVICES);
    chosen.push(second);
  }

  if (client.mockCohort === "LOIAL" && rng.bool(0.18)) {
    let third = rng.pick(SERVICES);
    while (chosen.some(s => s.id === third.id)) third = rng.pick(SERVICES);
    chosen.push(third);
  }

  return chosen;
}

function expectedInterval(client: MockClient): number {
  switch (client.mockCohort) {
    case "LOIAL": return 28;
    case "REGULAR": return 48;
    case "OCASIONAL": return 82;
    case "EM_RISCO": return 42;
    case "CHURN": return 38;
    case "NOVO": return 55;
  }
}

function visitProbability(
  client: MockClient,
  visitDate: Date,
  start: Date,
  end: Date
): number {
  const totalDays = Math.max(1, daysBetween(start, end));
  const ageDays = daysBetween(start, visitDate);
  const progress = ageDays / totalDays;

  switch (client.mockCohort) {
    case "LOIAL":
      return 0.90;
    case "REGULAR":
      return 0.76;
    case "OCASIONAL":
      return 0.48;
    case "EM_RISCO":
      return progress < 0.60 ? 0.72 : Math.max(0.08, 0.72 - (progress - 0.60) * 1.7);
    case "CHURN":
      return progress < 0.58 ? 0.75 : Math.max(0.01, 0.75 - (progress - 0.58) * 2.0);
    case "NOVO":
      return progress > 0.62 ? 0.60 : 0.12;
  }
}

export function generateOS(
  rng: RNG,
  clients: MockClient[],
  start: Date,
  end: Date
): GeneratedOS[] {
  const result: GeneratedOS[] = [];
  let osSequence = 1;

  for (const client of clients) {
    const joined = new Date(`${client.joinedAt}T12:00:00.000Z`);
    const firstDate = joined > start ? joined : start;
    let cursor = addDays(firstDate, rng.int(0, 14));
    const intervalBase = expectedInterval(client);

    while (cursor <= end) {
      if (rng.bool(visitProbability(client, cursor, start, end))) {
        const professional = rng.pick(PROFESSIONALS);
        const selected = serviceChoices(rng, client);
        const servicos = selected.map(s => ({
          id: s.id,
          nome: s.nome,
          quantidade: 1,
          precoUnitario: money(s.preco * rng.float(0.94, 1.08)),
          duracaoMin: s.duracaoMin
        }));

        const subtotal = money(servicos.reduce((sum, s) => sum + s.precoUnitario, 0));
        const desconto = rng.bool(client.mockCohort === "LOIAL" ? 0.18 : 0.10)
          ? money(subtotal * rng.float(0.05, 0.12))
          : 0;
        const total = money(subtotal - desconto);

        const created = new Date(cursor);
        created.setUTCHours(rng.int(8, 17), rng.pick([0, 15, 30, 45]), 0, 0);
        const duration = servicos.reduce((sum, s) => sum + s.duracaoMin, 0);
        const finalizado = addDays(created, 0);
        finalizado.setUTCMinutes(finalizado.getUTCMinutes() + duration);

        const id = slugId("mock-os", result.length);
        const status: "FINALIZADO" | "CANCELADO" = rng.bool(0.94) ? "FINALIZADO" : "CANCELADO";

        result.push({
          id,
          numero: `MOCK-${String(osSequence++).padStart(7, "0")}`,
          belezaId: "PLACEHOLDER",
          clienteId: client.id,
          clienteNome: client.nome,
          clienteTelefone: client.telefone,
          status,
          prioridade: rng.weighted([
            ["BAIXA", 0.60],
            ["MEDIA", 0.32],
            ["ALTA", 0.08]
          ]),
          colaboradorId: professional.id,
          colaboradorNome: professional.nome,
          servicos,
          totais: {
            subtotal,
            desconto,
            acrescimo: 0,
            total
          },
          createdAt: created.getTime(),
          updatedAt: finalizado.getTime(),
          finalizadoEm: status === "FINALIZADO" ? finalizado.getTime() : null,
          agendadoInicio: created.getTime(),
          agendadoFim: addDays(created, 0).getTime() + duration * 60_000
        });
      }

      const interval = Math.max(14, Math.round(intervalBase * rng.float(0.65, 1.45)));
      cursor = addDays(cursor, interval);
    }
  }

  return result;
}

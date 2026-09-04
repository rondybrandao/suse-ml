import { GeneratedFollowUp, GeneratedOS, MockClient } from "../types.js";
import { RNG, addDays, isoDateTime, randomDate, slugId } from "../utils.js";

export function generateFollowUps(
  rng: RNG,
  clients: MockClient[],
  osList: GeneratedOS[],
  end: Date
): GeneratedFollowUp[] {
  const result: GeneratedFollowUp[] = [];
  const finalizados = osList.filter(o => o.status === "FINALIZADO");

  for (const os of finalizados) {
    if (!rng.bool(0.72)) continue;

    const due = new Date(os.finalizadoEm ?? os.updatedAt);
    due.setUTCDate(due.getUTCDate() + rng.int(2, 8));
    const completed = due <= end && rng.bool(0.78);

    result.push({
      id: slugId("mock-crm", result.length),
      belezaId: os.belezaId,
      clienteId: os.clienteId,
      clienteNome: os.clienteNome,
      telefone: os.clienteTelefone,
      tipo: "pos_servico",
      canal: rng.weighted([
        ["whatsapp", 0.62],
        ["telefone", 0.18],
        ["presencial", 0.08],
        ["instagram", 0.08],
        ["email", 0.04]
      ]),
      dataPrevistaIso: isoDateTime(due),
      concluido: completed,
      concluidoEm: completed ? isoDateTime(addDays(due, rng.int(0, 3))) : null,
      origem: "os",
      refs: { osId: os.id, numeroOs: os.numero },
      observacoes: completed ? "Follow-up pós-serviço concluído." : "Follow-up pendente.",
      createdAt: os.createdAt,
      updatedAt: completed ? due.getTime() + 86_400_000 : Date.now()
    });
  }

  // Reativação para clientes sem atendimento recente.
  for (const client of clients) {
    const clientOS = finalizados
      .filter(o => o.clienteId === client.id)
      .sort((a, b) => (b.finalizadoEm ?? 0) - (a.finalizadoEm ?? 0));

    if (!clientOS.length) continue;

    const last = new Date(clientOS[0].finalizadoEm ?? clientOS[0].updatedAt);
    const daysSince = Math.floor((end.getTime() - last.getTime()) / 86_400_000);

    if (daysSince >= 75 && rng.bool(0.70)) {
      const due = addDays(end, rng.int(1, 10));
      result.push({
        id: slugId("mock-crm", result.length),
        belezaId: clientOS[0].belezaId,
        clienteId: client.id,
        clienteNome: client.nome,
        telefone: client.telefone,
        tipo: "reativacao",
        canal: rng.weighted([
          ["whatsapp", 0.70],
          ["telefone", 0.20],
          ["email", 0.06],
          ["instagram", 0.04]
        ]),
        dataPrevistaIso: isoDateTime(due),
        concluido: false,
        concluidoEm: null,
        origem: "os",
        refs: { osId: clientOS[0].id, numeroOs: clientOS[0].numero },
        observacoes: `Cliente sem atendimento há aproximadamente ${daysSince} dias.`,
        createdAt: end.getTime(),
        updatedAt: end.getTime()
      });
    }
  }

  return result;
}

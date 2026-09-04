import { GeneratedOrcamento, GeneratedOS } from "../types.js";
import { RNG, money, slugId } from "../utils.js";

export function generateBudgets(
  rng: RNG,
  osList: GeneratedOS[]
): GeneratedOrcamento[] {
  const result: GeneratedOrcamento[] = [];

  for (const os of osList) {
    if (!rng.bool(0.68)) continue;

    const itens = os.servicos.map(s => ({
      tipo: "SERVICO" as const,
      servicoId: s.id,
      descricao: s.nome,
      quantidade: s.quantidade,
      valorUnitario: s.precoUnitario,
      total: money(s.precoUnitario * s.quantidade)
    }));

    const subtotal = money(itens.reduce((sum, i) => sum + i.total, 0));
    const desconto = money(os.totais.desconto);
    const total = money(subtotal - desconto);

    result.push({
      id: slugId("mock-orc", result.length),
      osId: os.id,
      belezaId: os.belezaId,
      clienteId: os.clienteId,
      clienteNome: os.clienteNome,
      status: os.status === "FINALIZADO" ? "APROVADO" : "REJEITADO",
      versao: 1,
      itens,
      subtotal,
      desconto,
      total,
      createdAt: os.createdAt - 86_400_000,
      updatedAt: os.createdAt
    });
  }

  return result;
}

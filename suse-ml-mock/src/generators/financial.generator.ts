import { GeneratedOS } from "../types.js";
import { RNG, isoDateTime, money, slugId } from "../utils.js";

export function generateFinancial(
  rng: RNG,
  osList: GeneratedOS[]
): Array<Record<string, unknown>> {
  return osList
    .filter(o => o.status === "FINALIZADO")
    .map((os, index) => {
      const formas = ["pix", "cartao_credito", "cartao_debito", "dinheiro", "transferencia"] as const;
      const valorCentavos = Math.round(os.totais.total * 100);
      const comissaoPercentual = rng.float(25, 45);

      return {
        id: slugId("mock-fin", index),
        belezaId: os.belezaId,
        servicoNome: os.servicos.map(s => s.nome).join(" + "),
        clienteNome: os.clienteNome,
        prestadorNome: os.colaboradorNome,
        dataAtendimentoIso: isoDateTime(new Date(os.finalizadoEm ?? os.updatedAt)),
        formaPagamento: rng.pick(formas),
        valorCentavos,
        comissaoPercentual: Math.round(comissaoPercentual * 100) / 100,
        comissaoCentavos: Math.round(valorCentavos * comissaoPercentual / 100),
        observacoes: "Lançamento financeiro sintético.",
        tags: ["mock:ML", `os:${os.id}`],
        status: "pago",
        createdAt: os.createdAt,
        updatedAt: os.updatedAt,
        prestadorId: os.colaboradorId,
        servicoId: os.servicos[0]?.id ?? null
      };
    });
}

import { GeneratedHistory, GeneratedOS } from "../types.js";
import { slugId, isoDate } from "../utils.js";

export function generateHistory(osList: GeneratedOS[]): GeneratedHistory[] {
  const finalizados = osList.filter(o => o.status === "FINALIZADO");

  return finalizados.map((os, index) => ({
    id: slugId("mock-hist", index),
    userId: `mock-user-${os.clienteId.replace("mock-cli-", "").padStart(5, "0")}`,
    date: isoDate(new Date(os.finalizadoEm ?? os.updatedAt)),
    profissional: os.colaboradorNome,
    servicos: os.servicos.map(s => s.nome),
    valorTotal: os.totais.total,
    notas: "Registro sintético gerado para treinamento de Machine Learning.",
    fotos: [],
    refs: {
      osId: os.id,
      numeroOs: os.numero
    },
    origem: "os"
  }));
}

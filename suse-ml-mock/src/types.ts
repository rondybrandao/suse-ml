export type MockCohort =
  | "LOIAL"
  | "REGULAR"
  | "OCASIONAL"
  | "EM_RISCO"
  | "CHURN"
  | "NOVO";

export interface MockClient {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  nascimento: string;
  cidade: string;
  uf: string;
  userId: string;
  mockCohort: MockCohort;
  joinedAt: string;
}

export interface ServiceDef {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  duracaoMin: number;
}

export interface GeneratedOS {
  id: string;
  numero: string;
  belezaId: string;
  clienteId: string;
  clienteNome: string;
  clienteTelefone: string;
  status: "FINALIZADO" | "CANCELADO";
  prioridade: "BAIXA" | "MEDIA" | "ALTA";
  colaboradorId: string;
  colaboradorNome: string;
  servicos: Array<{
    id: string;
    nome: string;
    quantidade: number;
    precoUnitario: number;
    duracaoMin: number;
  }>;
  totais: {
    subtotal: number;
    desconto: number;
    acrescimo: number;
    total: number;
  };
  createdAt: number;
  updatedAt: number;
  finalizadoEm: number | null;
  agendadoInicio: number;
  agendadoFim: number;
}

export interface GeneratedOrcamento {
  id: string;
  osId: string;
  belezaId: string;
  clienteId: string;
  clienteNome: string;
  status: "APROVADO" | "REJEITADO";
  versao: number;
  itens: Array<{
    tipo: "SERVICO";
    servicoId: string;
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    total: number;
  }>;
  subtotal: number;
  desconto: number;
  total: number;
  createdAt: number;
  updatedAt: number;
}

export interface GeneratedFollowUp {
  id: string;
  belezaId: string;
  clienteId: string;
  clienteNome: string;
  telefone: string;
  tipo:
    | "pos_servico"
    | "retorno_orcamento"
    | "revisao_periodica"
    | "reativacao";
  canal: "whatsapp" | "telefone" | "presencial" | "instagram" | "email";
  dataPrevistaIso: string;
  concluido: boolean;
  concluidoEm: string | null;
  origem: "os" | "orcamento";
  refs: {
    osId?: string;
    orcamentoId?: string;
    numeroOs?: string;
  };
  observacoes: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface GeneratedHistory {
  id: string;
  userId: string;
  date: string;
  profissional: string;
  servicos: string[];
  valorTotal: number;
  notas: string;
  fotos: unknown[];
  refs: {
    osId: string;
    numeroOs: string;
  };
  origem: "os";
}

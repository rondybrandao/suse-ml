import { ServiceDef } from "../types.js";

export const SERVICES: ServiceDef[] = [
  { id: "srv-corte-fem", nome: "Corte feminino", categoria: "Corte feminino", preco: 65, duracaoMin: 60 },
  { id: "srv-corte-masc", nome: "Corte masculino", categoria: "Corte masculino", preco: 45, duracaoMin: 45 },
  { id: "srv-corte-inf", nome: "Corte infantil", categoria: "Corte infantil", preco: 40, duracaoMin: 40 },
  { id: "srv-barba", nome: "Barba/Design de barba", categoria: "Barba/Design de barba", preco: 45, duracaoMin: 35 },
  { id: "srv-escova", nome: "Escova/Finalização", categoria: "Escova/Finalização", preco: 55, duracaoMin: 50 },
  { id: "srv-coloracao", nome: "Coloração/Mechas/Luzes", categoria: "Coloração/Mechas/Luzes", preco: 180, duracaoMin: 150 },
  { id: "srv-hidratacao", nome: "Hidratação/Reconstrução capilar", categoria: "Hidratação/Reconstrução capilar", preco: 95, duracaoMin: 70 },
  { id: "srv-penteado", nome: "Penteado/Festa/Noiva", categoria: "Penteado/Festa/Noiva", preco: 150, duracaoMin: 100 },
  { id: "srv-sobrancelha", nome: "Sobrancelhas/Design", categoria: "Sobrancelhas/Design", preco: 35, duracaoMin: 30 },
  { id: "srv-cilios", nome: "Cílios (extensão/lifting)", categoria: "Cílios (extensão/lifting)", preco: 160, duracaoMin: 120 },
  { id: "srv-manicure", nome: "Manicure/Pedicure", categoria: "Manicure/Pedicure", preco: 55, duracaoMin: 60 },
  { id: "srv-along-unhas", nome: "Alongamento de unhas", categoria: "Alongamento de unhas", preco: 150, duracaoMin: 120 },
  { id: "srv-depilacao", nome: "Depilação com cera", categoria: "Depilação com cera", preco: 80, duracaoMin: 60 },
  { id: "srv-limpeza", nome: "Limpeza de pele", categoria: "Limpeza de pele", preco: 130, duracaoMin: 80 },
  { id: "srv-facial", nome: "Tratamentos faciais", categoria: "Tratamentos faciais", preco: 150, duracaoMin: 90 },
  { id: "srv-corporal", nome: "Tratamentos corporais", categoria: "Tratamentos corporais", preco: 180, duracaoMin: 100 },
  { id: "srv-massagem", nome: "Massagem/Relaxamento", categoria: "Massagem/Relaxamento", preco: 120, duracaoMin: 75 },
  { id: "srv-noiva", nome: "Pacote Dia da Noiva", categoria: "Pacote Dia da Noiva", preco: 650, duracaoMin: 300 }
];

export const PROFESSIONALS = [
  { id: "prof-001", nome: "Marina Costa" },
  { id: "prof-002", nome: "Juliana Alves" },
  { id: "prof-003", nome: "Camila Santos" },
  { id: "prof-004", nome: "Rafael Oliveira" },
  { id: "prof-005", nome: "Lucas Ferreira" },
  { id: "prof-006", nome: "Beatriz Souza" },
  { id: "prof-007", nome: "Gabriel Lima" },
  { id: "prof-008", nome: "Fernanda Rocha" },
  { id: "prof-009", nome: "Carolina Mendes" },
  { id: "prof-010", nome: "Thiago Ribeiro" },
  { id: "prof-011", nome: "Amanda Martins" },
  { id: "prof-012", nome: "Pedro Nogueira" }
];

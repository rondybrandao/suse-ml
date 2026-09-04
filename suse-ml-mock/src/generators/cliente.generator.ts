import { MockClient, MockCohort } from "../types.js";
import { RNG, isoDate, randomDate, slugId } from "../utils.js";

const FIRST_NAMES = [
  "Ana", "Beatriz", "Camila", "Carolina", "Clara", "Daniela", "Eduarda",
  "Fernanda", "Gabriela", "Helena", "Isabela", "Juliana", "Larissa",
  "Letícia", "Luana", "Mariana", "Natália", "Paula", "Rafaela", "Renata",
  "Sofia", "Valentina", "Amanda", "Bruna", "Débora", "Elaine", "Flávia",
  "Jéssica", "Kelly", "Patrícia", "Bianca", "Carlos", "Daniel", "Diego",
  "Eduardo", "Felipe", "Gabriel", "Gustavo", "Henrique", "João", "Lucas",
  "Marcelo", "Mateus", "Miguel", "Murilo", "Pedro", "Rafael", "Ricardo",
  "Rodrigo", "Samuel", "Thiago", "Vinícius", "Wesley"
];

const LAST_NAMES = [
  "Almeida", "Alves", "Barbosa", "Barros", "Cardoso", "Carvalho",
  "Castro", "Costa", "Dias", "Fernandes", "Ferreira", "Freitas",
  "Gomes", "Lima", "Lopes", "Machado", "Martins", "Mendes", "Moraes",
  "Moreira", "Nascimento", "Nogueira", "Oliveira", "Pereira", "Ramos",
  "Reis", "Ribeiro", "Rocha", "Rodrigues", "Santos", "Silva", "Soares",
  "Souza", "Teixeira", "Vieira"
];

const CITIES = [
  ["Manaus", "AM"], ["Belém", "PA"], ["Santarém", "PA"], ["Boa Vista", "RR"],
  ["Porto Velho", "RO"], ["Rio Branco", "AC"], ["Macapá", "AP"]
] as const;

export function generateClients(
  rng: RNG,
  count: number,
  start: Date,
  end: Date
): MockClient[] {
  const cohorts: Array<[MockCohort, number]> = [
    ["LOIAL", 0.20],
    ["REGULAR", 0.25],
    ["OCASIONAL", 0.20],
    ["EM_RISCO", 0.15],
    ["CHURN", 0.12],
    ["NOVO", 0.08],
  ];

  const result: MockClient[] = [];

  for (let i = 0; i < count; i++) {
    const first = rng.pick(FIRST_NAMES);
    const last = rng.pick(LAST_NAMES);
    const last2 = rng.bool(0.28) ? ` ${rng.pick(LAST_NAMES)}` : "";
    const nome = `${first} ${last}${last2}`;
    const id = slugId("mock-cli", i);
    const cohort = rng.weighted(cohorts);
    const city = rng.pick(CITIES);
    const joined = randomDate(rng, start, end);

    result.push({
      id,
      nome,
      telefone: `92${rng.int(900000000, 999999999)}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}.${i + 1}@mock.suse.local`,
      nascimento: `${rng.int(1965, 2007)}-${String(rng.int(1, 12)).padStart(2, "0")}-${String(rng.int(1, 28)).padStart(2, "0")}`,
      cidade: city[0],
      uf: city[1],
      userId: `mock-user-${String(i + 1).padStart(5, "0")}`,
      mockCohort: cohort,
      joinedAt: isoDate(joined),
    });
  }

  return result;
}

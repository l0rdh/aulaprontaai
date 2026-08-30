export const ETAPAS = [
  { value: "educacao-infantil", label: "Educação Infantil" },
  { value: "fund-iniciais", label: "Ensino Fundamental — Anos Iniciais (1º ao 5º)" },
  { value: "fund-finais", label: "Ensino Fundamental — Anos Finais (6º ao 9º)" },
  { value: "medio", label: "Ensino Médio" },
] as const;

export type EtapaValue = (typeof ETAPAS)[number]["value"];

export const ANOS: Record<EtapaValue, string[]> = {
  "educacao-infantil": [
    "Bebês (0 a 1 ano e 6 meses)",
    "Crianças bem pequenas (1 ano e 7 meses a 3 anos e 11 meses)",
    "Crianças pequenas (4 anos a 5 anos e 11 meses)",
  ],
  "fund-iniciais": ["1º ano", "2º ano", "3º ano", "4º ano", "5º ano"],
  "fund-finais": ["6º ano", "7º ano", "8º ano", "9º ano"],
  medio: ["1ª série", "2ª série", "3ª série"],
};

export const COMPONENTES: Record<EtapaValue, string[]> = {
  "educacao-infantil": [
    "O eu, o outro e o nós",
    "Corpo, gestos e movimentos",
    "Traços, sons, cores e formas",
    "Escuta, fala, pensamento e imaginação",
    "Espaços, tempos, quantidades, relações e transformações",
  ],
  "fund-iniciais": [
    "Língua Portuguesa",
    "Matemática",
    "Ciências",
    "Geografia",
    "História",
    "Arte",
    "Educação Física",
    "Língua Inglesa",
    "Ensino Religioso",
  ],
  "fund-finais": [
    "Língua Portuguesa",
    "Matemática",
    "Ciências",
    "Geografia",
    "História",
    "Arte",
    "Educação Física",
    "Língua Inglesa",
    "Ensino Religioso",
  ],
  medio: [
    "Linguagens e suas Tecnologias",
    "Matemática e suas Tecnologias",
    "Ciências da Natureza e suas Tecnologias",
    "Ciências Humanas e Sociais Aplicadas",
  ],
};

export const DURACOES = [
  { value: "30", label: "30 minutos" },
  { value: "50", label: "50 minutos" },
  { value: "100", label: "100 minutos (aula dupla)" },
];

export function etapaLabel(value: string) {
  return ETAPAS.find((e) => e.value === value)?.label ?? value;
}

export const TODOS_COMPONENTES = Array.from(
  new Set([
    ...COMPONENTES["educacao-infantil"],
    ...COMPONENTES["fund-iniciais"],
    ...COMPONENTES["medio"],
  ]),
);

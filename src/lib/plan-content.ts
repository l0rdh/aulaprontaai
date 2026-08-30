export type BnccCode = { code: string; description: string };

export type ScheduleStage = {
  stage: string;
  durationMinutes: number;
  description: string;
  teacherAction: string;
};

export type LessonContent = {
  title: string;
  generalObjective: string;
  specificObjectives: string[];
  bnccCodes: BnccCode[];
  materials: string[];
  schedule: ScheduleStage[];
  assessment: { type: string; description: string; criteria: string[] };
  homework: string | null;
  inclusionNotes: string | null;
  notes: string | null;
};

const CODE_PREFIX: Record<string, string> = {
  "educacao-infantil": "EI03",
  "fund-iniciais": "EF03",
  "fund-finais": "EF06",
  medio: "EM13",
};

const AREA_SIGLA: Record<string, string> = {
  "Língua Portuguesa": "LP",
  Matemática: "MA",
  Ciências: "CI",
  Geografia: "GE",
  História: "HI",
  Arte: "AR",
  "Educação Física": "EF",
  "Língua Inglesa": "LI",
  "Ensino Religioso": "ER",
};

function proporcao(total: number, fatia: number) {
  return Math.max(5, Math.round((total * fatia) / 5) * 5);
}

export function buildMockPlan(input: {
  etapa: string;
  ano: string;
  componente: string;
  tema: string;
  duracao: number;
  observacoes?: string;
}): LessonContent {
  const { etapa, ano, componente, tema, duracao, observacoes } = input;
  const prefix = CODE_PREFIX[etapa] ?? "EF06";
  const sigla = AREA_SIGLA[componente] ?? "LGG";

  const acolhida = proporcao(duracao, 0.1);
  const introducao = proporcao(duracao, 0.2);
  const desenvolvimento = proporcao(duracao, 0.4);
  const pratica = proporcao(duracao, 0.2);
  const fechamento = Math.max(
    5,
    duracao - (acolhida + introducao + desenvolvimento + pratica),
  );

  return {
    title: `${tema} — ${componente} (${ano})`,
    generalObjective: `Compreender os conceitos centrais de "${tema}" em ${componente}, relacionando-os com situações do cotidiano da turma do ${ano}.`,
    specificObjectives: [
      `Identificar os elementos essenciais de ${tema.toLowerCase()}.`,
      `Aplicar o que foi aprendido em uma atividade prática em duplas.`,
      `Registrar conclusões próprias sobre ${tema.toLowerCase()} no caderno.`,
      `Participar da roda de conversa argumentando com base no que foi estudado.`,
    ],
    bnccCodes: [
      {
        code: `${prefix}${sigla}01`,
        description: `Reconhecer e utilizar os conceitos fundamentais relacionados a ${tema.toLowerCase()} em situações-problema do contexto escolar.`,
      },
      {
        code: `${prefix}${sigla}07`,
        description: `Resolver e elaborar situações que envolvam ${tema.toLowerCase()}, comunicando o raciocínio utilizado com apoio de registros escritos e orais.`,
      },
      {
        code: `${prefix}${sigla}12`,
        description: `Colaborar com colegas na construção coletiva do conhecimento sobre ${tema.toLowerCase()}, respeitando diferentes ritmos de aprendizagem.`,
      },
    ],
    materials: [
      "Quadro branco e pincéis",
      "Caderno e lápis dos estudantes",
      `Folha de atividade impressa sobre ${tema.toLowerCase()} (1 por dupla)`,
      "Cartolina ou papel kraft para o registro coletivo",
      "Projetor (opcional, para exibir os exemplos iniciais)",
    ],
    schedule: [
      {
        stage: "Acolhida",
        durationMinutes: acolhida,
        description: `Receber a turma e retomar rapidamente o que foi visto na aula anterior, conectando com ${tema.toLowerCase()}.`,
        teacherAction:
          "Cumprimente a turma, organize os lugares e faça duas perguntas rápidas de sondagem para medir o que já sabem.",
      },
      {
        stage: "Introdução",
        durationMinutes: introducao,
        description: `Apresentar o tema "${tema}" a partir de uma situação concreta e próxima da realidade dos estudantes.`,
        teacherAction:
          "Escreva o objetivo da aula no quadro, apresente o exemplo disparador e anote as hipóteses levantadas pela turma.",
      },
      {
        stage: "Desenvolvimento",
        durationMinutes: desenvolvimento,
        description: `Explicar os conceitos centrais de ${tema.toLowerCase()} com exemplos progressivos, do mais simples ao mais complexo.`,
        teacherAction:
          "Conduza a explicação em três exemplos comentados, verificando a compreensão com perguntas dirigidas a estudantes diferentes.",
      },
      {
        stage: "Atividade Prática",
        durationMinutes: pratica,
        description:
          "Trabalho em duplas com a folha de atividade, aplicando o conteúdo em situações novas.",
        teacherAction:
          "Circule pela sala, atenda as duplas com mais dificuldade primeiro e registre erros recorrentes para retomar no fechamento.",
      },
      {
        stage: "Fechamento",
        durationMinutes: fechamento,
        description:
          "Socialização das respostas, correção coletiva e síntese do que foi aprendido.",
        teacherAction:
          "Peça que duas duplas apresentem a resolução, corrija os erros mais comuns e feche retomando o objetivo escrito no quadro.",
      },
    ],
    assessment: {
      type: "Avaliação formativa (observação + registro escrito)",
      description: `Acompanhamento durante a atividade prática somado à análise do registro individual no caderno sobre ${tema.toLowerCase()}.`,
      criteria: [
        "Participa das discussões e apresenta hipóteses próprias.",
        "Aplica corretamente o conceito na atividade em dupla.",
        "Comunica o raciocínio de forma clara, oralmente ou por escrito.",
        "Colabora com o colega respeitando o ritmo da dupla.",
      ],
    },
    homework: `Resolver três situações sobre ${tema.toLowerCase()} no caderno e trazer uma dúvida escrita para a próxima aula.`,
    inclusionNotes: observacoes?.trim()
      ? `Adaptações a partir das observações da turma: ${observacoes.trim()}. Garanta apoio visual no quadro, tempo estendido na atividade prática e verificação individual da compreensão.`
      : "Ofereça apoio visual no quadro, tempo estendido para quem precisar e revise as instruções individualmente com os estudantes que demonstrarem dificuldade.",
    notes:
      "Plano gerado como demonstração desta versão. Ajuste os exemplos ao contexto da sua escola antes de aplicar.",
  };
}

export function planToPlainText(content: LessonContent) {
  const linhas: string[] = [];
  linhas.push(content.title.toUpperCase(), "");
  linhas.push("OBJETIVO GERAL", content.generalObjective, "");
  linhas.push("OBJETIVOS ESPECÍFICOS");
  content.specificObjectives.forEach((o) => linhas.push(`- ${o}`));
  linhas.push("", "HABILIDADES BNCC");
  content.bnccCodes.forEach((b) => linhas.push(`- ${b.code}: ${b.description}`));
  linhas.push("", "MATERIAIS");
  content.materials.forEach((m) => linhas.push(`- ${m}`));
  linhas.push("", "CRONOGRAMA DA AULA");
  content.schedule.forEach((s) =>
    linhas.push(
      `- ${s.stage} (${s.durationMinutes} min): ${s.description} | Professor(a): ${s.teacherAction}`,
    ),
  );
  linhas.push("", "AVALIAÇÃO", `${content.assessment.type}`, content.assessment.description);
  content.assessment.criteria.forEach((c) => linhas.push(`- ${c}`));
  if (content.homework) linhas.push("", "TAREFA DE CASA", content.homework);
  if (content.inclusionNotes) linhas.push("", "INCLUSÃO", content.inclusionNotes);
  if (content.notes) linhas.push("", "OBSERVAÇÕES", content.notes);
  return linhas.join("\n");
}

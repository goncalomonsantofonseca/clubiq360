import type { PresentationConfig, SolutionKey } from "@/app/presentation/types";

const brandPalette = {
  navy: "#0f172a",
  orange: "#f27427",
  white: "#f8fafc",
} as const;

const clubPresets = {
  damaiense: {
    name: "Damaiense",
    shortName: "Damaiense",
    logoSrc: "/logos/Damaiense/Damaiense.png",
    backgroundLogoSrc: "/logos/Damaiense/LogoDamaienseBranco25.png",
    heroImage: "/presentation/club-hero.svg",
    tagline:
      "BackOffice, Website e App para reforçar organização, imagem e conexão com os sócios.",
    clubColors: {
      primary: "#c62032",
      secondary: "#22c55e",
      accent: "#ff5a6f",
      surface: "#3a0f18",
      contrast: "#fff5f6",
    },
  },
} as const;

const activeClubKey: keyof typeof clubPresets = "damaiense";

const companyConfig = {
  brandName: "ClubIQ",
  logoSrc: "/logos/ClubIQLogo.png",
  symbolSrc: "/logos/ClubIQSimbolo.png",
  deckName: "ClubIQ 360",
  mission:
    "A ClubIQ organiza operação, imagem e ligação com o sócio num ecossistema digital modular para clubes de futebol.",
  promise:
    "Mostramos só o caminho certo para cada clube, sem ruído e sem complexidade desnecessária.",
  foundedLabel: "Empresa constituída em março de 2026",
  euTrademarkLabel: "Marca registada na UE em abril de 2026",
  proofPoints: [
    "Compromisso com o crescimento do clube.",
    "Proximidade no acompanhamento.",
    "Antecipação estratégica de problemas.",
  ],
  milestones: [
    {
      label: "Fev",
      title: "Primeira App",
      description: "Lançamento da primeira app: A.D.Oeiras Official App.",
    },
    {
      label: "Mar",
      title: "Empresa + equipa",
      description: "Constituição da empresa e contratação de colaboradores.",
    },
    {
      label: "Abr",
      title: "Registo UE",
      description: "Registo oficial da empresa na União Europeia.",
    },
  ],
  founders: [
    {
      name: "Francisco Costa",
      role: "Co-fundador",
      bio: "Compromisso com o crescimento e acompanhamento dos clubes.",
      imageSrc: "/Francisco_SemFundo.png",
    },
    {
      name: "Gonçalo Fonseca",
      role: "Co-fundador",
      bio: "Proximidade no contacto rápido e resolução de problemas.",
      imageSrc: "/goncaloSemFundo.png",
    },
    {
      name: "Tiago Filipe",
      role: "Co-fundador",
      bio: "Antecipação estratégica de desafios antes de chegarem ao clube.",
      imageSrc: "/TiagoSemFundo.png",
    },
  ],
} as const;

const solutionCatalog: PresentationConfig["solutionCatalog"] = {
  "bo-manual": {
    key: "bo-manual",
    shortLabel: "BackOffice",
    menuLabel: "BackOffice",
    title: "BackOffice",
    summary: "Organização, controlo e operação centralizada do clube.",
    priceLabel: "Sem pagamentos",
    pricingMode: "fixed",
    conditions: "Registo e cobrança manual.",
    previewImage: "/presentation/backoffice-preview.svg",
    highlights: ["Organização", "Controlo", "Processo"],
    features: ["Sócios", "Processos", "Gestão", "Histórico"],
    outcomes: ["Mais ordem", "Menos erro", "Mais tempo"],
    idealFor: ["Estrutura pequena", "Início digital", "Operação manual"],
    nextStep: "Escolher: com pagamentos ou sem pagamentos.",
  },
  "bo-payments": {
    key: "bo-payments",
    shortLabel: "BackOffice",
    menuLabel: "BackOffice com pagamentos",
    title: "BackOffice com pagamentos",
    summary: "Automação de cobrança com apoio por email.",
    priceLabel: "Com pagamentos",
    pricingMode: "hybrid",
    conditions: "Fluxos por email e controlo financeiro.",
    previewImage: "/presentation/backoffice-preview.svg",
    highlights: ["Cobrança", "Automação", "Seguimento"],
    features: ["Notificações", "Dívidas", "Histórico", "Relatórios"],
    outcomes: ["Menos carga", "Mais cobrança", "Mais previsão"],
    idealFor: ["Clube em crescimento", "Mais volume", "Secretaria ativa"],
    nextStep: "Definir regras de cobrança e comunicação.",
  },
  "website-only": {
    key: "website-only",
    shortLabel: "Website",
    menuLabel: "Website",
    title: "Website",
    summary: "Imagem digital forte e comunicação institucional.",
    priceLabel: "Sem BackOffice",
    pricingMode: "quote",
    conditions: "Suporte e atualizações de conteúdo.",
    previewImage: "/presentation/website-preview.svg",
    highlights: ["Imagem", "Comunicação", "Presença"],
    features: ["Páginas", "Conteúdo", "História", "Contactos"],
    outcomes: ["Mais visibilidade", "Mais clareza", "Mais confiança"],
    idealFor: ["Foco imagem", "Projeto institucional", "Inicio web"],
    nextStep: "Escolher: com BackOffice ou sem BackOffice.",
  },
  "website-bo": {
    key: "website-bo",
    shortLabel: "Website",
    menuLabel: "Website com BackOffice",
    title: "Website com BackOffice",
    summary: "Website vivo, atualizado por dados operacionais.",
    priceLabel: "Com BackOffice",
    pricingMode: "quote",
    conditions: "Integra operação com comunicação.",
    previewImage: "/presentation/website-preview.svg",
    highlights: ["Integração", "Atualização", "Profundidade"],
    features: ["Dados vivos", "Conteúdo dinâmico", "Menos retrabalho", "Escala"],
    outcomes: ["Mais coerência", "Mais eficiência", "Mais impacto"],
    idealFor: ["Clube estruturado", "Ambição digital", "Escala"],
    nextStep: "Definir ligações entre operação e website.",
  },
  app: {
    key: "app",
    shortLabel: "Aplicação Móvel",
    menuLabel: "Aplicação Móvel",
    title: "Aplicação Móvel",
    summary: "Conexão diária com sócio no bolso.",
    priceLabel: "Mobile",
    pricingMode: "quote",
    conditions: "App publicada com identidade do clube.",
    dependencyNote: "App implica base operacional no BackOffice.",
    addOnNote: "Pode integrar com website.",
    previewImage: "/presentation/app-preview.svg",
    highlights: ["Conexão", "Recorrência", "Experiência"],
    features: ["Cartão digital", "Eventos", "Jogos", "Pagamentos"],
    outcomes: ["Mais proximidade", "Mais engagement", "Mais valor"],
    idealFor: ["Foco no sócio", "Canal mobile", "Crescimento"],
    nextStep: "Escolher: com website ou sem website.",
  },
};

const presentationContent = {
  coverEyebrow: "",
  coverTitlePrefix: "O Universo Digital do",
  coverSubtitleTemplate: "",
  hubTitle: "ClubIQ 360",
  hubSubtitle: "Soluções para todas as feridas do clube.",
  hubInstruction:
    "BackOffice organiza, Website projeta imagem, App cria conexão.",
  closingTitle: "Fecho",
  closingSubtitle: "Definimos o caminho certo para o clube.",
} as const;

export const presentationConfig: PresentationConfig = {
  brandPalette,
  clubConfig: clubPresets[activeClubKey],
  companyConfig,
  solutionCatalog,
  presentationContent,
  defaultHubSolution: "bo-manual",
};

export const orderedSolutions: SolutionKey[] = [
  "bo-manual",
  "website-only",
  "app",
  "bo-payments",
  "website-bo",
];

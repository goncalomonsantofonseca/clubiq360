export type SolutionKey =
  | "bo-manual"
  | "bo-payments"
  | "website-only"
  | "website-bo"
  | "app";

export interface BrandPalette {
  navy: string;
  orange: string;
  white: string;
}

export interface ClubThemeConfig {
  name: string;
  shortName: string;
  logoSrc: string;
  backgroundLogoSrc?: string;
  tagline: string;
  heroImage?: string;
  clubColors: {
    primary: string;
    secondary: string;
    accent: string;
    surface: string;
    contrast: string;
  };
}

export interface CompanyMilestone {
  label: string;
  title: string;
  description: string;
}

export interface FounderProfile {
  name: string;
  role: string;
  bio: string;
  imageSrc: string;
}

export interface CompanyConfig {
  brandName: string;
  logoSrc: string;
  symbolSrc: string;
  deckName: string;
  mission: string;
  promise: string;
  foundedLabel: string;
  euTrademarkLabel: string;
  proofPoints: readonly string[];
  milestones: readonly CompanyMilestone[];
  founders: readonly FounderProfile[];
}

export interface SolutionDefinition {
  key: SolutionKey;
  shortLabel: string;
  title: string;
  menuLabel: string;
  summary: string;
  priceLabel: string;
  pricingMode: "fixed" | "hybrid" | "quote";
  conditions: string;
  dependencyNote?: string;
  addOnNote?: string;
  previewImage: string;
  highlights: readonly string[];
  features: readonly string[];
  outcomes: readonly string[];
  idealFor: readonly string[];
  nextStep: string;
}

export interface PresentationContent {
  coverEyebrow: string;
  coverTitlePrefix: string;
  coverSubtitleTemplate: string;
  hubTitle: string;
  hubSubtitle: string;
  hubInstruction: string;
  closingTitle: string;
  closingSubtitle: string;
}

export interface PresentationSlide {
  id: string;
  label: string;
  category: "shared" | "route" | "closing";
  solutionKey?: SolutionKey;
}

export interface PresentationRouteState {
  selectedSolution: SolutionKey | null;
  previewSolution: SolutionKey | null;
}

export interface PresentationConfig {
  brandPalette: BrandPalette;
  clubConfig: ClubThemeConfig;
  companyConfig: CompanyConfig;
  solutionCatalog: Record<SolutionKey, SolutionDefinition>;
  presentationContent: PresentationContent;
  defaultHubSolution: SolutionKey;
}

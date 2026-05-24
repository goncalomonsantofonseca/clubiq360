import type { ClubThemeConfig } from "@/app/presentation/types";

export const templateClubConfig: ClubThemeConfig = {
  name: "Nome Completo do Clube",
  shortName: "Nome do Clube",
  logoSrc: "/logos/CLUBE/logo-principal.png",
  backgroundLogoSrc: "/logos/CLUBE/logo-fundo-branco.png",
  heroImage: "/presentation/club-hero.svg",
  tagline: "Frase curta da proposta para este clube.",
  clubColors: {
    primary: "#000000",
    secondary: "#ffffff",
    accent: "#999999",
    surface: "#111111",
    contrast: "#f8fafc",
  },
};


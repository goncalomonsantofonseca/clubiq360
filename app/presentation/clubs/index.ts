import type { ClubThemeConfig } from "@/app/presentation/types";
import { damaienseClubConfig } from "@/app/presentation/clubs/damaiense";
import { santamariaClubConfig } from "@/app/presentation/clubs/udrsantamaria";

export const clubPresets = {
  damaiense: damaienseClubConfig,
  udrsantamaria: santamariaClubConfig,
} as const satisfies Record<string, ClubThemeConfig>;

export type ClubPresetKey = keyof typeof clubPresets;

export const activeClubKey: ClubPresetKey = "udrsantamaria";

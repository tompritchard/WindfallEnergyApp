import type { DashboardTheme, ThemeDefinition } from "./types";

type ThemeModule = {
  default: ThemeDefinition;
};

const themeModules = import.meta.glob<ThemeModule>("./*/index.ts", {
  eager: true,
});

function folderNameFromPath(path: string): string {
  const match = path.match(/\.\/([^/]+)\/index\.ts$/);
  return match?.[1] ?? "Unknown";
}

function prettifyLabel(folderName: string): string {
  return folderName
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const loadedThemes: DashboardTheme[] = [];

for (const [path, mod] of Object.entries(themeModules)) {
  if (!mod || !mod.default) continue;

  const folderName = folderNameFromPath(path);

  loadedThemes.push({
    id: folderName,
    label: prettifyLabel(folderName),
    ...mod.default,
  });
}

loadedThemes.sort((a, b) => a.label.localeCompare(b.label));

export const themes: DashboardTheme[] = loadedThemes;
export const themesById: Record<string, DashboardTheme> = Object.fromEntries(
  themes.map((theme) => [theme.id, theme])
) as Record<string, DashboardTheme>;

export const defaultTheme: DashboardTheme | null = themes[0] ?? null;
export const defaultThemeId: string = defaultTheme?.id ?? "";

export function getThemeById(themeId?: string | null): DashboardTheme | null {
  if (!themeId) return defaultTheme;
  return themesById[themeId] ?? defaultTheme;
}

export function getDefaultThemeId(): string {
  return defaultThemeId;
}

export type { DashboardTheme } from "./types";
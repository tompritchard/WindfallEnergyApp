import React from "react";
import type { DashboardTheme } from "../theme";

type ThemeSelectorProps = {
  themes?: DashboardTheme[];
  selectedThemeId?: string;
  onChange: (themeId: string) => void;
  label?: string;
  theme: DashboardTheme;
};

export default function ThemeSelector({
  themes,
  selectedThemeId,
  onChange,
  label = "Theme",
  theme,
}: ThemeSelectorProps) {
  const ui = theme.components.themeSelector;
  const safeThemes = Array.isArray(themes) ? themes : [];
  const safeSelectedThemeId =
    typeof selectedThemeId === "string" && selectedThemeId.length > 0
      ? selectedThemeId
      : safeThemes.length > 0
      ? safeThemes[0].id
      : "";

  return (
    <div style={ui.wrapper}>
      <label htmlFor="theme-selector" style={ui.label}>
        {label}
      </label>

      <div style={{ position: "relative" }}>
        <select
          id="theme-selector"
          value={safeSelectedThemeId}
          onChange={(e) => onChange(e.target.value)}
          style={ui.select}
          disabled={safeThemes.length === 0}
        >
          {safeThemes.length === 0 ? (
            <option value="">No themes available</option>
          ) : (
            safeThemes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))
          )}
        </select>

        <div style={ui.caret}>▼</div>
      </div>
    </div>
  );
}
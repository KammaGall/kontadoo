import { createSlice } from "@reduxjs/toolkit";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  mode: Theme;
}

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "system";
  const saved = localStorage.getItem("kontadoo_theme") as Theme;
  if (saved && ["light", "dark", "system"].includes(saved)) {
    return saved;
  }
  return "system";
};

const applyTheme = (mode: Theme) => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const isDark =
    mode === "dark" ||
    (mode === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

const initialState: ThemeState = {
  mode: getInitialTheme(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.mode = action.payload;
      localStorage.setItem("kontadoo_theme", action.payload);
      applyTheme(action.payload);
    },

    initTheme: (state) => {
      applyTheme(state.mode);
    },
  },
});

export const { setTheme, initTheme } = themeSlice.actions;
export default themeSlice.reducer;

export const selectTheme = (state: any) => state.theme.mode;

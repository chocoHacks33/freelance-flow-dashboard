const STORAGE_KEY = "freelance-flow:theme";
const VALID_THEMES = new Set(["light", "dark"]);

export function resolveTheme(savedTheme, systemPrefersDark = false) {
  return VALID_THEMES.has(savedTheme) ? savedTheme : systemPrefersDark ? "dark" : "light";
}

export function getNextTheme(currentTheme) {
  return currentTheme === "dark" ? "light" : "dark";
}

function loadStylesheet() {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("../../styles/features/theme-preference.css", import.meta.url).href;
  document.head.append(stylesheet);
}

function readTheme(storage) {
  try {
    return storage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveTheme(storage, theme) {
  try {
    storage.setItem(STORAGE_KEY, theme);
  } catch {
    // The selected theme still applies for this page when storage is unavailable.
  }
}

function applyTheme(theme, button) {
  document.documentElement.dataset.theme = theme;
  button.setAttribute("aria-pressed", String(theme === "dark"));
  button.setAttribute("aria-label", theme === "dark" ? "Use light theme" : "Use dark theme");
  button.textContent = theme === "dark" ? "Light theme" : "Dark theme";
}

export function initializeThemePreference(
  storage = localStorage,
  mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
) {
  loadStylesheet();

  const button = document.createElement("button");
  button.className = "theme-toggle";
  button.type = "button";
  document.querySelector(".site-header").append(button);

  let theme = resolveTheme(readTheme(storage), mediaQuery.matches);
  applyTheme(theme, button);

  button.addEventListener("click", () => {
    theme = getNextTheme(theme);
    applyTheme(theme, button);
    saveTheme(storage, theme);
  });
}

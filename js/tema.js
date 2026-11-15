(function () {
  const storageKey = "lenguaje-de-marcas-tema";
  const root = document.documentElement;
  const button = document.createElement("button");
  const icon = document.createElement("span");

  button.id = "theme-toggle";
  button.type = "button";
  button.setAttribute("aria-pressed", "false");
  icon.setAttribute("aria-hidden", "true");

  function readTheme() {
    try {
      return window.localStorage.getItem(storageKey) === "night" ? "night" : "day";
    } catch (error) {
      console.warn("No se pudo leer el tema guardado.", error);
      return "day";
    }
  }

  function saveTheme(theme) {
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch (error) {
      console.warn("No se pudo guardar el tema seleccionado.", error);
    }
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    button.setAttribute("aria-pressed", String(theme === "night"));
    button.setAttribute(
      "aria-label",
      theme === "night" ? "Cambiar al modo d\u00EDa" : "Cambiar al modo noche",
    );
    icon.className =
      theme === "night" ? "theme-icon theme-icon--sun" : "theme-icon theme-icon--moon";
    button.replaceChildren(
      icon,
      document.createTextNode(theme === "night" ? "Modo d\u00EDa" : "Modo noche"),
    );
  }

  let currentTheme = readTheme();
  applyTheme(currentTheme);
  document.body.append(button);

  button.addEventListener("click", function () {
    currentTheme = currentTheme === "night" ? "day" : "night";
    applyTheme(currentTheme);
    saveTheme(currentTheme);
  });
})();

let currentLang = "pt";

document.getElementById("langBtn").addEventListener("click", () => {
  currentLang = currentLang === "pt" ? "en" : "pt";
  // Aqui depois faremos a troca de textos dinâmicos
  alert(`Idioma alterado para: ${currentLang}`);
});

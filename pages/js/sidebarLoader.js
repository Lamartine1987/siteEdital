document.addEventListener("DOMContentLoaded", async () => {
  const sidebarContainer = document.getElementById("sidebar-container");

  try {
    const res = await fetch("/pages/components/sidebar.html");
    if (!res.ok) throw new Error("Arquivo não encontrado!");
    const html = await res.text();
    sidebarContainer.innerHTML = html;

    // Aguarda o DOM da sidebar ser inserido
    setTimeout(() => {
      const sidebar = document.getElementById("sidebar");
      const toggleBtn = document.getElementById("menuToggleBtn");

      if (!sidebar || !toggleBtn) {
        console.warn("Sidebar ou botão não encontrados.");
        return;
      }

      toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        sidebar.classList.toggle("ativo");
        document.body.classList.toggle("sidebar-ativo");
      });

      document.addEventListener("click", (e) => {
        if (!sidebar.contains(e.target) && e.target.id !== "menuToggleBtn") {
          sidebar.classList.remove("ativo");
          document.body.classList.remove("sidebar-ativo");
        }
      });

      console.log("✅ Sidebar carregada e funcional.");
    }, 0);
  } catch (err) {
    console.error("❌ Erro ao carregar Sidebar:", err);
  }
});

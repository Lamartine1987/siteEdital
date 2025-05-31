document.addEventListener("DOMContentLoaded", function () {
  const sidebarContainer = document.getElementById("sidebar-container");

  fetch("/pages/components/sidebar.html")
    .then((res) => {
      if (!res.ok) throw new Error("Arquivo não encontrado!");
      return res.text();
    })
    .then((html) => {
      sidebarContainer.innerHTML = html;

      setTimeout(() => {
        const sidebar = document.getElementById("sidebar");
        const toggleBtn = document.getElementById("menuToggleBtn");

        if (!sidebar || !toggleBtn) {
          console.warn("Sidebar ou botão não encontrados.");
          return;
        }

        toggleBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          sidebar.classList.toggle("ativo");
          document.body.classList.toggle("sidebar-ativo");
        });

        document.addEventListener("click", function (e) {
          if (
            !sidebar.contains(e.target) &&
            e.target.id !== "menuToggleBtn"
          ) {
            sidebar.classList.remove("ativo");
            document.body.classList.remove("sidebar-ativo");
          }
        });

        console.log("✅ Sidebar carregada e funcional.");
      }, 0);
    })
    .catch((err) => console.error("❌ Erro ao carregar Sidebar:", err));
});

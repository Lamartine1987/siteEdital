document.addEventListener("DOMContentLoaded", async () => {
  const painel = document.getElementById("painelEstatisticas");
  const sidebar = document.getElementById("sidebar");
  const menuToggleBtn = document.getElementById("menuToggleBtn");
  const sairBtn = document.getElementById("sairBtn");

  // === LÓGICA DO MENU LATERAL (☰) ===
  if (sidebar && menuToggleBtn) {
    // Abre ou fecha o menu ao clicar no botão ☰
    menuToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // evita conflito com o listener global
      sidebar.classList.toggle("ativo");
    });

    // Fecha o menu ao clicar fora dele
    document.addEventListener("click", (e) => {
      if (!sidebar.contains(e.target) && e.target !== menuToggleBtn) {
        sidebar.classList.remove("ativo");
      }
    });
  }

  // === BOTÃO DE SAIR ===
  if (sairBtn) {
    sairBtn.addEventListener("click", () => {
      if (confirm("Deseja realmente sair da sua conta?")) {
        firebase.auth().signOut().then(() => {
          alert("Sessão encerrada!");
          window.location.href = "../index.html";
        });
      }
    });
  }

  // === VERIFICA SE O USUÁRIO ESTÁ AUTENTICADO ===
  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "../index.html"; // redireciona se não estiver logado
      return;
    }

    const userId = user.uid;
    const db = firebase.database();

    // === BUSCA OS DADOS DE TEMPO DE ESTUDO DO USUÁRIO ===
    const tempoSnap = await db.ref(`usuarios/${userId}/tempoEstudo`).once("value");
    const tempoEstudo = tempoSnap.val() || {};

    let totalSegundos = 0;

    // Soma todos os registros de tempo
    for (const edital in tempoEstudo) {
      for (const cargo in tempoEstudo[edital]) {
        for (const materia in tempoEstudo[edital][cargo]) {
          for (const assuntoId in tempoEstudo[edital][cargo][materia]) {
            const registros = tempoEstudo[edital][cargo][materia][assuntoId];
            for (const key in registros) {
              totalSegundos += registros[key]?.tempo || 0;
            }
          }
        }
      }
    }

    // === FORMATA O TEMPO TOTAL EM h m s ===
    const formatarTempo = (s) => {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const ss = s % 60;
      return `${h}h ${m}m ${ss}s`;
    };

    // === EXIBE O RESULTADO NO PAINEL ===
    painel.innerHTML = `
      <div class="estatistica-box">
        <h3>⏱️ Total de Tempo Estudado</h3>
        <p>${formatarTempo(totalSegundos)}</p>
      </div>
    `;
  });
});

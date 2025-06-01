document.addEventListener("DOMContentLoaded", async () => {
  const painel = document.getElementById("painelEstatisticas");
  const cursosContainer = document.getElementById("cursosMatriculados");
  const sidebar = document.getElementById("sidebar");
  const menuToggleBtn = document.getElementById("menuToggleBtn");
  const sairBtn = document.getElementById("sairBtn");

  // === ABRE/FECHA MENU LATERAL ===
  if (sidebar && menuToggleBtn) {
    menuToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebar.classList.toggle("ativo");
    });

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
      window.location.href = "../index.html";
      return;
    }

    const userId = user.uid;
    const db = firebase.database();

    // === TEMPO TOTAL DE ESTUDO ===
    const tempoSnap = await db.ref(`usuarios/${userId}/tempoEstudo`).once("value");
    const tempoEstudo = tempoSnap.val() || {};
    let totalSegundos = 0;

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

    const formatarTempo = (s) => {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const ss = s % 60;
      return `${h}h ${m}m ${ss}s`;
    };

    painel.innerHTML = `
      <div class="estatistica-box">
        <h3>⏱️ Total de Tempo Estudado</h3>
        <p>${formatarTempo(totalSegundos)}</p>
      </div>
    `;

    // === CURSOS MATRICULADOS COMO LISTA ===
    if (cursosContainer) {
      cursosContainer.innerHTML = "<p>Carregando cursos...</p>";

      const matriculadosSnap = await db.ref(`usuarios/${userId}/matriculados`).once("value");
      const dados = matriculadosSnap.val();

      cursosContainer.innerHTML = "";

      if (!dados) {
        cursosContainer.innerHTML = "<p>Você ainda não está matriculado em nenhum curso.</p>";
        return;
      }

      const listaCursos = document.createElement("ul");
      listaCursos.className = "lista-cursos";

      for (const idEdital in dados) {
        const cargos = dados[idEdital];
        for (const nomeCargo in cargos) {
          const curso = cargos[nomeCargo];

          const li = document.createElement("li");
          li.innerHTML = `
            <span class="nome-curso">${curso.nome || "Curso"} - ${curso.cargo || nomeCargo}</span>
            <button onclick="acessarCurso('${idEdital}', '${nomeCargo}')">Acessar curso</button>
          `;
          listaCursos.appendChild(li);
        }
      }

      // Cabeçalho + Lista dentro de card
      const box = document.createElement("div");
      box.className = "curso-box";
      box.appendChild(listaCursos);

      cursosContainer.appendChild(box);
    }
  });
});

// === FUNÇÃO DE REDIRECIONAMENTO AO CLICAR NO BOTÃO DO CURSO ===
function acessarCurso(idEdital, nomeCargo) {
  const url = `materias/paginaEditais.html?id=${encodeURIComponent(idEdital)}&cargo=${encodeURIComponent(nomeCargo)}`;
  window.location.href = url;
}

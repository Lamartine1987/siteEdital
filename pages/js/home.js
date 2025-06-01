document.addEventListener("DOMContentLoaded", async () => {
  const painel = document.getElementById("painelEstatisticas");
  const cursosContainer = document.getElementById("cursosMatriculados");
  const selectCurso = document.getElementById("selectCurso");
  const selectMateria = document.getElementById("selectMateria");
  const sidebar = document.getElementById("sidebar");
  const menuToggleBtn = document.getElementById("menuToggleBtn");
  const sairBtn = document.getElementById("sairBtn");

  // === MENU LATERAL ===
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

  // === SAIR ===
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

  // === AUTENTICAÇÃO ===
  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "../index.html";
      return;
    }

    const userId = user.uid;
    const db = firebase.database();

    // === Tempo total estudado ===
    const tempoSnap = await db.ref(`usuarios/${userId}/tempoEstudo`).once("value");
    const tempoEstudo = tempoSnap.val() || {};

    const formatarTempo = (s) => {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const ss = s % 60;
      return `${h}h ${m}m ${ss}s`;
    };

    // === Preencher cursos disponíveis ===
    const matriculadosSnap = await db.ref(`usuarios/${userId}/matriculados`).once("value");
    const dados = matriculadosSnap.val();

    selectCurso.innerHTML = "<option value=''>Selecione um curso</option>";
    for (const edital in dados) {
      for (const cargo in dados[edital]) {
        const nome = dados[edital][cargo].nome || edital;
        const cargoNome = dados[edital][cargo].cargo || cargo;
        const opt = document.createElement("option");
        opt.value = `${edital}|||${cargo}`;
        opt.textContent = `${nome} - ${cargoNome}`;
        selectCurso.appendChild(opt);
      }
    }

    // === Tempo total global (inicial)
    let totalSegundos = 0;
    for (const edital in tempoEstudo) {
      for (const cargo in tempoEstudo[edital]) {
        for (const materia in tempoEstudo[edital][cargo]) {
          for (const assunto in tempoEstudo[edital][cargo][materia]) {
            const registros = tempoEstudo[edital][cargo][materia][assunto];
            for (const key in registros) {
              totalSegundos += registros[key]?.tempo || 0;
            }
          }
        }
      }
    }

    painel.innerHTML = `
      <div class="estatistica-box">
        <h3>⏱️ Total de Tempo Estudado</h3>
        <p>${formatarTempo(totalSegundos)}</p>
      </div>
    `;

    // === Ao selecionar curso, popular matérias
    selectCurso.addEventListener("change", () => {
      const [edital, cargo] = selectCurso.value.split("|||");
      selectMateria.innerHTML = "<option value=''>Selecione uma matéria</option>";

      if (!tempoEstudo[edital] || !tempoEstudo[edital][cargo]) return;

      const materias = Object.keys(tempoEstudo[edital][cargo]);
      materias.forEach((materia) => {
        const opt = document.createElement("option");
        opt.value = materia;
        opt.textContent = materia;
        selectMateria.appendChild(opt);
      });
    });

    // === Ao selecionar matéria, mostrar tempo total
    selectMateria.addEventListener("change", () => {
      const [edital, cargo] = selectCurso.value.split("|||");
      const materia = selectMateria.value;
      let segundos = 0;

      if (
        tempoEstudo?.[edital]?.[cargo]?.[materia]
      ) {
        const assuntos = tempoEstudo[edital][cargo][materia];
        for (const assunto in assuntos) {
          const registros = assuntos[assunto];
          for (const key in registros) {
            segundos += registros[key]?.tempo || 0;
          }
        }
      }

      painel.innerHTML = `
        <div class="estatistica-box">
          <h3>📚 Tempo Estudado da Matéria</h3>
          <p>${formatarTempo(segundos)}</p>
        </div>
      `;
    });

    // === Lista de cursos matriculados (sem progresso)
    if (cursosContainer) {
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

      const box = document.createElement("div");
      box.className = "curso-box";
      box.appendChild(listaCursos);
      cursosContainer.appendChild(box);
    }
  });
});

function acessarCurso(idEdital, nomeCargo) {
  const url = `materias/paginaEditais.html?id=${encodeURIComponent(idEdital)}&cargo=${encodeURIComponent(nomeCargo)}`;
  window.location.href = url;
}

document.addEventListener("DOMContentLoaded", async () => {
  const painel = document.getElementById("painelEstatisticas");
  const cursosContainer = document.getElementById("cursosMatriculados");
  const sidebar = document.getElementById("sidebar");
  const menuToggleBtn = document.getElementById("menuToggleBtn");
  const sairBtn = document.getElementById("sairBtn");

  let selectCurso, selectMateria;

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

  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "../index.html";
      return;
    }

    const userId = user.uid;
    const db = firebase.database();

    const tempoSnap = await db.ref(`usuarios/${userId}/tempoEstudo`).once("value");
    const tempoEstudo = tempoSnap.val() || {};

    const matriculadosSnap = await db.ref(`usuarios/${userId}/matriculados`).once("value");
    const dados = matriculadosSnap.val() || {};

    const formatarTempo = (s) => {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const ss = s % 60;
      return `${h}h ${m}m ${ss}s`;
    };

    // Exibir painel com relógio zerado inicialmente
    painel.innerHTML = `
      <div class="estatistica-box">
        <h3>⏱️ Tempo Estudado</h3>
        <div class="filtro-curso-materia">
          <select id="selectCurso"><option value="">Selecione um curso</option></select>
          <select id="selectMateria" disabled><option value="">Selecione uma matéria</option></select>
        </div>
        <p id="tempoEstudadoTexto">0h 0m 0s</p>
      </div>
    `;

    selectCurso = document.getElementById("selectCurso");
    selectMateria = document.getElementById("selectMateria");
    const tempoEstudadoTexto = document.getElementById("tempoEstudadoTexto");

    for (const edital in dados) {
      for (const cargo in dados[edital]) {
        const curso = dados[edital][cargo];
        const option = document.createElement("option");
        option.value = `${edital}|||${cargo}`;
        option.textContent = `${curso.nome || edital} - ${curso.cargo || cargo}`;
        selectCurso.appendChild(option);
      }
    }

    selectCurso.addEventListener("change", () => {
      const [edital, cargo] = selectCurso.value.split("|||");
      selectMateria.innerHTML = `<option value="">Selecione uma matéria</option>`;
      selectMateria.disabled = true;
      tempoEstudadoTexto.textContent = "0h 0m 0s";

      if (!tempoEstudo?.[edital]?.[cargo]) return;

      let segundos = 0;
      const materias = Object.keys(tempoEstudo[edital][cargo]);
      materias.forEach((materia) => {
        const opt = document.createElement("option");
        opt.value = materia;
        opt.textContent = materia;
        selectMateria.appendChild(opt);

        // Soma tempo de todas as matérias
        const assuntos = tempoEstudo[edital][cargo][materia];
        for (const assunto in assuntos) {
          const registros = assuntos[assunto];
          for (const key in registros) {
            segundos += registros[key]?.tempo || 0;
          }
        }
      });

      tempoEstudadoTexto.textContent = formatarTempo(segundos);
      selectMateria.disabled = false;
    });

    selectMateria.addEventListener("change", () => {
      const [edital, cargo] = selectCurso.value.split("|||");
      const materia = selectMateria.value;
      let segundos = 0;

      if (tempoEstudo?.[edital]?.[cargo]?.[materia]) {
        const assuntos = tempoEstudo[edital][cargo][materia];
        for (const assunto in assuntos) {
          const registros = assuntos[assunto];
          for (const key in registros) {
            segundos += registros[key]?.tempo || 0;
          }
        }
      }

      tempoEstudadoTexto.textContent = formatarTempo(segundos);
    });

    // Exibir cursos matriculados
    if (cursosContainer) {
      cursosContainer.innerHTML = "";

      if (!dados || Object.keys(dados).length === 0) {
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
  const url = `materias/paginaEditais.html?id=${encodeURIComponent(idEdital)}&cargoSelecionado=${encodeURIComponent(nomeCargo)}`;
  window.location.href = url;
}




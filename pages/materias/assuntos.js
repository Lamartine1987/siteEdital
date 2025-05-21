// Função de logout
function logout() {
  firebase.auth().signOut().then(() => {
    location.href = "../index.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const idEdital = params.get("id");
  const cargo = params.get("cargo");
  const materia = params.get("materia");

  document.getElementById("tituloMateria").textContent = materia;

  const container = document.getElementById("assuntosContainer");
  const db = firebase.database();

  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      alert("É necessário estar logado");
      location.href = "../index.html";
      return;
    }

    const userId = user.uid;
    const tipoSnapshot = await db.ref(`usuarios/${userId}/tipo`).once("value");
    const tipoUsuario = tipoSnapshot.val() || "gratuito";
    const podeMarcarEstudo = ["cargo", "edital", "anual"].includes(tipoUsuario);

    const refMatricula = podeMarcarEstudo
      ? db.ref(`usuarios/${userId}/matriculados/${idEdital}/${cargo}`)
      : db.ref(`usuarios/${userId}/matriculados`);

    const matriculaSnap = await refMatricula.once("value");
    const dadosMatricula = matriculaSnap.val();

    const estaMatriculado = podeMarcarEstudo
      ? !!dadosMatricula
      : dadosMatricula?.id === idEdital && dadosMatricula?.cargo === cargo;

    if (!estaMatriculado) {
      alert("Você precisa se matricular neste cargo para visualizar os assuntos.");
      location.href = `paginaEditais.html?id=${idEdital}`;
      return;
    }

    const snapshot = await db.ref("editais").once("value");
    const editais = snapshot.val();

    let assuntos = [];
    for (const chave in editais) {
      if (editais[chave].id === idEdital) {
        assuntos = editais[chave].cargos?.[cargo]?.materias?.[materia] || [];
        break;
      }
    }

    const progressoSnap = await db
      .ref(`usuarios/${userId}/progresso/${idEdital}/${cargo}/${materia}`)
      .once("value");
    const progresso = progressoSnap.val() || {};

    const tempoSnap = await db
      .ref(`usuarios/${userId}/tempoEstudo/${idEdital}/${cargo}/${materia}`)
      .once("value");
    const tempoEstudo = tempoSnap.val() || {};

    container.innerHTML = "";

    if (!podeMarcarEstudo) {
      const aviso = document.createElement("div");
      aviso.className = "aviso-plano";
      aviso.innerHTML = `
        <span class="icone">🔒</span>
        Quer salvar seu progresso? <a href="../cadastro.html">Ative um plano</a> e aproveite recursos extras!
      `;
      container.appendChild(aviso);
    }

    const cronometros = {}; // Controla cronômetros ativos

    function formatarTempo(segundos) {
      const h = Math.floor(segundos / 3600);
      const m = Math.floor((segundos % 3600) / 60);
      const s = segundos % 60;
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }

    assuntos.forEach((texto) => {
      const assuntoKey = texto.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, "");

      const linha = document.createElement("div");
      linha.className = "assunto-row";
      if (progresso[assuntoKey]) linha.classList.add("estudado");

      const span = document.createElement("div");
      span.className = "assunto-texto";
      span.textContent = texto;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = !!progresso[assuntoKey];
      checkbox.disabled = !podeMarcarEstudo;

      checkbox.onchange = async () => {
        if (!podeMarcarEstudo) {
          alert("Você precisa de um plano pago para marcar assuntos como estudado.");
          checkbox.checked = false;
          return;
        }

        await db.ref(`usuarios/${userId}/progresso/${idEdital}/${cargo}/${materia}/${assuntoKey}`)
          .set(checkbox.checked);

        linha.classList.toggle("estudado", checkbox.checked);
      };

      const cronometro = document.createElement("i");
      cronometro.className = "fas fa-clock iniciar-cronometro";
      cronometro.title = "Iniciar estudo";

      const contador = document.createElement("span");
      contador.className = "contador-tempo";
      let tempoInicial = tempoEstudo[assuntoKey] || 0;
      contador.textContent = formatarTempo(tempoInicial);

      // Inicializa o intervalo como nulo
      cronometros[assuntoKey] = {
        elemento: cronometro,
        tempo: tempoInicial,
        intervalo: null,
        atualizar: () => {
          cronometros[assuntoKey].tempo += 1;
          contador.textContent = formatarTempo(cronometros[assuntoKey].tempo);
        }
      };

      cronometro.addEventListener("click", () => {
        const atual = cronometros[assuntoKey];

        if (atual.intervalo) {
          // PARAR o cronômetro
          clearInterval(atual.intervalo);
          atual.intervalo = null;
          cronometro.classList.remove("ativo");

          db.ref(`usuarios/${userId}/tempoEstudo/${idEdital}/${cargo}/${materia}/${assuntoKey}`)
            .set(atual.tempo);
        } else {
          // PARAR os outros cronômetros
          Object.keys(cronometros).forEach((chave) => {
            if (cronometros[chave].intervalo) {
              clearInterval(cronometros[chave].intervalo);
              cronometros[chave].elemento.classList.remove("ativo");
              db.ref(`usuarios/${userId}/tempoEstudo/${idEdital}/${cargo}/${materia}/${chave}`)
                .set(cronometros[chave].tempo);
              cronometros[chave].intervalo = null;
            }
          });

          // INICIAR atual
          cronometro.classList.add("ativo");
          atual.intervalo = setInterval(() => atual.atualizar(), 1000);
        }
      });

      const editar = document.createElement("i");
      editar.className = "fas fa-pen";
      editar.title = "Editar";
      editar.onclick = () => {
        const novoTexto = prompt("Editar assunto:", texto);
        if (novoTexto && novoTexto !== texto) {
          alert("Função de edição será implementada.");
        }
      };

      const excluir = document.createElement("i");
      excluir.className = "fas fa-trash";
      excluir.title = "Excluir";
      excluir.onclick = () => {
        alert("Função de exclusão será implementada.");
      };

      const actions = document.createElement("div");
      actions.className = "assunto-acoes";
      actions.appendChild(cronometro);
      actions.appendChild(contador);
      actions.appendChild(checkbox);
      actions.appendChild(editar);
      actions.appendChild(excluir);

      linha.appendChild(span);
      linha.appendChild(actions);
      container.appendChild(linha);
    });
  });
});

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

    const cronometros = {};

    function formatarTempo(segundos) {
      const h = Math.floor(segundos / 3600);
      const m = Math.floor((segundos % 3600) / 60);
      const s = segundos % 60;
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }

    function adicionarRegistroHistorico(registro, lista) {
      const li = document.createElement("li");
      const data = new Date(registro.data);
      const tempo = formatarTempo(registro.tempo);
      li.textContent = `${data.toLocaleString("pt-BR")} - ${tempo}`;
      lista.prepend(li);
    }

    assuntos.forEach(async (texto) => {
      const assuntoKey = texto.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, "");

      const item = document.createElement("div");
      item.className = "assunto-item";

      const cabecalho = document.createElement("div");
      cabecalho.className = "assunto-cabecalho";

      const tituloSpan = document.createElement("span");
      tituloSpan.className = "titulo-assunto";
      tituloSpan.textContent = texto;

      const totalSpan = document.createElement("span");
      totalSpan.className = "tempo-total"; // precisa ter no CSS

      const iconeSeta = document.createElement("i");
      iconeSeta.className = "fas fa-chevron-down";

      cabecalho.appendChild(tituloSpan);
      cabecalho.appendChild(totalSpan);
      cabecalho.appendChild(iconeSeta);

      cabecalho.addEventListener("click", () => {
        item.classList.toggle("expandido");
      });

      const detalhes = document.createElement("div");
      detalhes.className = "assunto-detalhes";

      const blocoCrono = document.createElement("div");
      blocoCrono.className = "bloco-cronometro";

      const cronometro = document.createElement("i");
      cronometro.className = "iniciar-cronometro fas play";
      cronometro.title = "Clique para iniciar ou pausar o tempo de estudo";

      const labelCrono = document.createElement("span");
      labelCrono.className = "label-cronometro";
      labelCrono.textContent = "Iniciar estudo";

      const contador = document.createElement("span");
      contador.className = "contador-tempo";
      contador.textContent = "00:00:00";

      const salvarBtn = document.createElement("i");
      salvarBtn.className = "icon-salvar";
      salvarBtn.title = "Salvar tempo de estudo";

      const resetarBtn = document.createElement("i");
      resetarBtn.className = "icon-reiniciar";
      resetarBtn.title = "Reiniciar tempo";

      const listaHistorico = document.createElement("ul");
      listaHistorico.className = "lista-historico";

      const historicoSnap = await db
        .ref(`usuarios/${userId}/tempoEstudo/${idEdital}/${cargo}/${materia}/${assuntoKey}`)
        .once("value");
      const historico = historicoSnap.val();
      let tempoTotal = 0;

      if (historico) {
        Object.values(historico).forEach((registro) => {
          tempoTotal += registro.tempo || 0;
          adicionarRegistroHistorico(registro, listaHistorico);
        });
      }

      totalSpan.textContent = formatarTempo(tempoTotal);

      let tempoInicial = 0;

      cronometros[assuntoKey] = {
        elemento: cronometro,
        tempo: tempoInicial,
        intervalo: null,
        atualizar: () => {
          cronometros[assuntoKey].tempo += 1;
          contador.textContent = formatarTempo(cronometros[assuntoKey].tempo);
        },
        label: labelCrono,
      };

      cronometro.addEventListener("click", () => {
        const atual = cronometros[assuntoKey];
        if (atual.intervalo) {
          clearInterval(atual.intervalo);
          atual.intervalo = null;
          cronometro.classList.remove("ativo", "pause");
          cronometro.classList.add("play");
          labelCrono.textContent = "Iniciar estudo";
        } else {
          Object.keys(cronometros).forEach((chave) => {
            if (cronometros[chave].intervalo) {
              clearInterval(cronometros[chave].intervalo);
              cronometros[chave].elemento.classList.remove("ativo", "pause");
              cronometros[chave].elemento.classList.add("play");
              cronometros[chave].label.textContent = "Iniciar estudo";
              cronometros[chave].intervalo = null;
            }
          });
          cronometro.classList.add("ativo", "pause");
          cronometro.classList.remove("play");
          labelCrono.textContent = "Pausar estudo";
          atual.intervalo = setInterval(() => atual.atualizar(), 1000);
        }
      });

      salvarBtn.addEventListener("click", async () => {
        const tempoEstudado = cronometros[assuntoKey].tempo;
        const agora = new Date();
        const timestamp = agora.toISOString();

        const registro = { tempo: tempoEstudado, data: timestamp };

        await db
          .ref(`usuarios/${userId}/tempoEstudo/${idEdital}/${cargo}/${materia}/${assuntoKey}`)
          .push(registro);

        adicionarRegistroHistorico(registro, listaHistorico);

        tempoTotal += tempoEstudado;
        totalSpan.textContent = formatarTempo(tempoTotal);

        cronometros[assuntoKey].tempo = 0;
        contador.textContent = "00:00:00";
        alert("Sessão salva com sucesso!");
      });

      resetarBtn.addEventListener("click", () => {
        clearInterval(cronometros[assuntoKey].intervalo);
        cronometros[assuntoKey].tempo = 0;
        contador.textContent = "00:00:00";
        cronometros[assuntoKey].intervalo = null;
        cronometro.classList.remove("ativo", "pause");
        cronometro.classList.add("play");
        labelCrono.textContent = "Iniciar estudo";
      });

      blocoCrono.append(cronometro, labelCrono, contador, salvarBtn, resetarBtn, listaHistorico);

      const blocoCheck = document.createElement("div");
      blocoCheck.className = "bloco-checkbox";

      const labelCheck = document.createElement("label");
      labelCheck.textContent = "Estudado";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = !!progresso[assuntoKey];
      checkbox.disabled = !podeMarcarEstudo;

      if (checkbox.checked) item.classList.add("estudado");

      checkbox.onchange = async () => {
        if (!podeMarcarEstudo) {
          alert("Você precisa de um plano pago para marcar como estudado.");
          checkbox.checked = false;
          return;
        }

        await db
          .ref(`usuarios/${userId}/progresso/${idEdital}/${cargo}/${materia}/${assuntoKey}`)
          .set(checkbox.checked);

        item.classList.toggle("estudado", checkbox.checked);
      };

      labelCheck.appendChild(checkbox);
      blocoCheck.appendChild(labelCheck);

      detalhes.append(blocoCrono, blocoCheck);
      item.append(cabecalho, detalhes);
      container.appendChild(item);
    });
  });
});

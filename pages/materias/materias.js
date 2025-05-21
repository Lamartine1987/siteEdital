// ✅ CÓDIGO COMPLETO COM REGRAS AJUSTADAS PARA TODOS OS PLANOS (gratuito, cargo, edital, anual), MODAL E PROGRESSO

document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const idEdital = params.get("id")?.trim();
  const cargoSelecionado = params.get("cargo")?.trim();
  const materiaSelecionada = params.get("materia")?.trim();

  const titulo = document.getElementById("tituloEdital");
  const container = document.getElementById("materiasContainer");
  const tituloSecao = document.getElementById("tituloSecao");
  const breadcrumb = document.getElementById("breadcrumb");

  if (!idEdital) {
    titulo.textContent = "Nenhum edital selecionado.";
    return;
  }

  firebase
    .database()
    .ref("editais")
    .once("value")
    .then((snapshot) => {
      const editais = snapshot.val();
      const editalEncontrado = Object.values(editais).find(
        (e) => e.id === idEdital
      );

      if (!editalEncontrado) {
        titulo.textContent = "Edital não encontrado.";
        return;
      }

      titulo.textContent = editalEncontrado.nome;
      breadcrumb.textContent = cargoSelecionado
        ? materiaSelecionada
          ? `Cargos › ${cargoSelecionado} › ${materiaSelecionada}`
          : `Cargos › ${cargoSelecionado}`
        : `Cargos`;

      container.innerHTML = "";
      const cargos = editalEncontrado.cargos;

      firebase.auth().onAuthStateChanged(async function (user) {
        if (!user) return;

        const userId = user.uid;
        const snapUser = await firebase
          .database()
          .ref(`usuarios/${userId}`)
          .once("value");
        const dadosUsuario = snapUser.val() || {};
        const tipoUsuario = dadosUsuario.tipo || "gratuito";
        const matriculados = dadosUsuario.matriculados || {};
        const progressoUsuario = dadosUsuario.progresso?.[idEdital] || {};

        if (!cargoSelecionado && !materiaSelecionada) {
          tituloSecao.style.display = "none";
          const grupo = document.createElement("div");
          grupo.className = "grupo-cargos";

          const subtitulo = document.createElement("h2");
          subtitulo.textContent = "Cargos";
          subtitulo.className = "titulo-cargos";

          const lista = document.createElement("div");
          lista.className = "cards-container";

          for (const nomeCargo in cargos) {
            const materias = cargos[nomeCargo].materias || {};
            let totalAssuntos = 0;
            let totalEstudados = 0;

            for (const nomeMateria in materias) {
              const assuntos = materias[nomeMateria];
              totalAssuntos += Object.keys(assuntos).length;
              const progressoMateria =
                progressoUsuario?.[nomeCargo]?.[nomeMateria] || {};
              totalEstudados += Object.values(progressoMateria).filter(
                (v) => v === true
              ).length;
            }

            const percentual =
              totalAssuntos > 0
                ? Math.round((totalEstudados / totalAssuntos) * 100)
                : 0;

            const wrapper = document.createElement("div");
            wrapper.className = "card-wrapper";

            const card = document.createElement("div");
            card.className = "card-materia";
            card.innerHTML = `
            <h3>${nomeCargo}</h3>
            <div style="background: #e0e0e0; border-radius: 6px; height: 8px; overflow: hidden; width: 100%;">
              <div style="width: ${percentual}%; height: 100%; background: #007bff;"></div>
            </div>
            <small style="color: #555">Progresso: ${percentual}%</small>
          `;

            card.onclick = () => {
              window.location.href = `paginaEditais.html?id=${idEdital}&cargo=${encodeURIComponent(
                nomeCargo
              )}`;
            };

            const btn = document.createElement("button");
            btn.className = "btn-matricular";

            let estaMatriculado = false;

            if (["anual", "edital", "cargo"].includes(tipoUsuario)) {
              estaMatriculado = !!matriculados?.[idEdital]?.[nomeCargo];
            } else {
              estaMatriculado =
                matriculados?.id === idEdital &&
                matriculados?.cargo === nomeCargo;
            }

            const bloquearMatricula = (msg) => alert(msg);

            const matricular = () => {
              const matricula = {
                nome: editalEncontrado.nome,
                id: idEdital,
                cargo: nomeCargo,
                dataMatricula: new Date().toISOString(),
              };

              const ref = ["anual", "edital", "cargo"].includes(tipoUsuario)
                ? firebase
                    .database()
                    .ref(
                      `usuarios/${userId}/matriculados/${idEdital}/${nomeCargo}`
                    )
                : firebase.database().ref(`usuarios/${userId}/matriculados`);

              ref.set(matricula).then(() => {
                alert("Matriculado com sucesso!");
                location.reload();
              });
            };

            const desmatricular = () => {
              const updates = ["anual", "edital", "cargo"].includes(tipoUsuario)
                ? {
                    [`usuarios/${userId}/matriculados/${idEdital}/${nomeCargo}`]:
                      null,
                    [`usuarios/${userId}/progresso/${idEdital}/${nomeCargo}`]:
                      null,
                    [`usuarios/${userId}/tempoEstudo/${idEdital}/${nomeCargo}`]:
                      null,
                  }
                : {
                    [`usuarios/${userId}/matriculados`]: null,
                    [`usuarios/${userId}/progresso`]: null,
                    [`usuarios/${userId}/tempoEstudo`]: null,
                  };

              firebase
                .database()
                .ref()
                .update(updates)
                .then(() => {
                  alert("Desmatriculado com sucesso!");
                  location.reload();
                });
            };

            if (estaMatriculado) {
              btn.textContent = "Desmatricular";
              btn.style.backgroundColor = "#dc3545";
              btn.style.color = "white";
              btn.onclick = (e) => {
                e.stopPropagation();
                criarModalConfirmacao(
                  "Deseja mesmo desmatricular e apagar o progresso?",
                  desmatricular
                );
              };
            } else {
              btn.textContent = "Matricular";
              btn.style.backgroundColor = "#28a745";
              btn.style.color = "white";
              btn.onclick = (e) => {
                e.stopPropagation();

                if (tipoUsuario === "gratuito") {
                  const jaMatriculado = Object.keys(matriculados).length > 0;
                  const editalDiferente = matriculados?.id !== idEdital;
                  const cargoDiferente = matriculados?.cargo !== nomeCargo;

                  if (jaMatriculado && (editalDiferente || cargoDiferente)) {
                    return bloquearMatricula(
                      "Você já está matriculado em outro cargo."
                    );
                  }
                } else if (tipoUsuario === "cargo") {
                  const editaisMatriculados = Object.keys(matriculados || {});
                  const jaTemOutroEdital = editaisMatriculados.some(
                    (eid) => eid !== idEdital
                  );

                  if (jaTemOutroEdital) {
                    return bloquearMatricula(
                      "Com o plano atual, você só pode se matricular em um cargo de um único edital."
                    );
                  }

                  const jaMatriculadoNoMesmoEdital =
                    Object.keys(matriculados[idEdital] || {}).length > 0;
                  if (jaMatriculadoNoMesmoEdital) {
                    return bloquearMatricula(
                      "Você já está matriculado em um cargo neste edital, para aproveitar as outras funcionalidades, faça o updgrade do seu plano e matricule-se em qualquer cargo do edital atual."
                    );
                  }
                } else if (
                  tipoUsuario === "edital" &&
                  !matriculados[idEdital] &&
                  Object.keys(matriculados).length > 0
                ) {
                  return bloquearMatricula(
                    "Você só pode se matricular em cargos do mesmo edital."
                  );
                }

                matricular();
              };
            }

            wrapper.appendChild(card);
            wrapper.appendChild(btn);
            lista.appendChild(wrapper);
          }

          grupo.appendChild(subtitulo);
          grupo.appendChild(lista);
          container.appendChild(grupo);
          return;
        }

        // Matérias
        if (cargoSelecionado && !materiaSelecionada) {
          tituloSecao.style.display = "block";
          tituloSecao.textContent = "Matérias";

          const cargoData = cargos[cargoSelecionado];
          if (!cargoData || !cargoData.materias) {
            container.innerHTML =
              "<p>Nenhuma matéria encontrada para este cargo.</p>";
            return;
          }

          const progresso = progressoUsuario?.[cargoSelecionado] || {};
          const materiasContainer = document.createElement("div");
          materiasContainer.className = "materias-container";

          for (const nomeMateria in cargoData.materias) {
            const assuntos = cargoData.materias[nomeMateria];
            const total = Object.keys(assuntos).length;
            const estudados = Object.values(
              progresso[nomeMateria] || {}
            ).filter((v) => v === true).length;
            const percentual =
              total > 0 ? Math.round((estudados / total) * 100) : 0;

            const card = document.createElement("div");
            card.className = "card-materia";
            card.innerHTML = `
            <h3>${nomeMateria}</h3>
            <div style="margin-top: 6px; font-size: 14px; color: #666;">Progresso: ${percentual}%</div>
          `;
            card.onclick = () => {
              window.location.href = `assuntos.html?id=${idEdital}&cargo=${encodeURIComponent(
                cargoSelecionado
              )}&materia=${encodeURIComponent(nomeMateria)}`;
            };

            materiasContainer.appendChild(card);
          }

          container.appendChild(materiasContainer);
        }
      });
    });

  document.getElementById("voltarBtn").addEventListener("click", () => {
    window.location.href = "../index.html";
  });

  document.getElementById("sairBtn").addEventListener("click", () => {
    criarModalConfirmacao("Deseja realmente sair da sua conta?", () => {
      firebase
        .auth()
        .signOut()
        .then(() => {
          alert("Sessão encerrada!");
          window.location.href = "../index.html";
        });
    });
  });

  if (!document.getElementById("estiloModalGlobal")) {
    const estilo = document.createElement("style");
    estilo.id = "estiloModalGlobal";
    estilo.innerHTML = `
      .modal-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex; align-items: center; justify-content: center;
        z-index: 1000;
      }
      .modal-box {
        background: white;
        padding: 24px;
        border-radius: 10px;
        text-align: center;
        max-width: 400px;
        width: 90%;
      }
      .modal-actions {
        display: flex;
        justify-content: center;
        gap: 16px;
        margin-top: 24px;
      }
    `;
    document.head.appendChild(estilo);
  }

  window.criarModalConfirmacao = function (mensagem, callback) {
    if (document.getElementById("modalConfirmacaoGenerico")) return;

    const modal = document.createElement("div");
    modal.id = "modalConfirmacaoGenerico";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-box">
        <h3>Confirmação</h3>
        <p>${mensagem}</p>
        <div class="modal-actions">
          <button id="btnConfirmar" class="confirm-btn">Sim</button>
          <button id="btnCancelar" class="cancel-btn">Não</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("btnConfirmar").onclick = () => {
      modal.remove();
      callback();
    };
    document.getElementById("btnCancelar").onclick = () => modal.remove();
  };
});

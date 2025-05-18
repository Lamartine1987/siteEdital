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
            const card = document.createElement("div");
            card.className = "card-materia";
            card.innerHTML = `<h3>${nomeCargo}</h3>`;

            const btn = document.createElement("button");
            btn.className = "btn-matricular";
            btn.style.marginTop = "10px";
            btn.style.padding = "6px 12px";
            btn.style.border = "none";
            btn.style.borderRadius = "6px";
            btn.style.cursor = "pointer";
            btn.style.fontWeight = "bold";

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

              let ref = ["anual", "edital", "cargo"].includes(tipoUsuario)
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
                  }
                : {
                    [`usuarios/${userId}/matriculados`]: null,
                    [`usuarios/${userId}/progresso`]: null,
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
                if (tipoUsuario === "cargo") {
                  if (
                    confirm(
                      "Ao se desmatricular, todo o progresso será perdido. Deseja continuar?"
                    )
                  ) {
                    desmatricular();
                  }
                } else {
                  desmatricular();
                }
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
                    bloquearMatricula(
                      "Você já está matriculado em outro cargo. Para continuar, desmatricule-se primeiro e depois matricule-se em qualquer outro."
                    );
                    return;
                  }
                } else if (tipoUsuario === "cargo") {
                  const editaisMatriculados = Object.keys(matriculados || {});
                  const jaTemOutroEdital = editaisMatriculados.some(
                    (eid) => eid !== idEdital
                  );

                  if (jaTemOutroEdital) {
                    bloquearMatricula(
                      "Você só pode se matricular em um cargo de um único edital. Desmatricule-se primeiro."
                    );
                    return;
                  }

                  const jaMatriculadoNoMesmoEdital =
                    Object.keys(matriculados[idEdital] || {}).length > 0;
                  if (jaMatriculadoNoMesmoEdital) {
                    bloquearMatricula(
                      "Você já está matriculado em um cargo neste edital. Desmatricule-se primeiro e depois matricule-se em qualquer outro."
                    );
                    return;
                  }
                } else if (
                  tipoUsuario === "edital" &&
                  !matriculados[idEdital] &&
                  Object.keys(matriculados).length > 0
                ) {
                  bloquearMatricula(
                    "Você só pode se matricular em cargos do mesmo edital."
                  );
                  return;
                }

                matricular();
              };
            }

            card.onclick = (e) => {
              if (e.target === card || e.target.tagName === "H3") {
                window.location.href = `paginaEditais.html?id=${idEdital}&cargo=${encodeURIComponent(
                  nomeCargo
                )}`;
              }
            };

            card.appendChild(btn);
            lista.appendChild(card);
          }

          grupo.appendChild(subtitulo);
          grupo.appendChild(lista);
          container.appendChild(grupo);
        } else if (cargoSelecionado && !materiaSelecionada) {
          tituloSecao.style.display = "block";
          tituloSecao.textContent = "Matérias";

          const cargoData = cargos[cargoSelecionado];
          if (!cargoData || !cargoData.materias) {
            container.innerHTML =
              "<p>Nenhuma matéria encontrada para este cargo.</p>";
            return;
          }

          for (const nomeMateria in cargoData.materias) {
            const card = document.createElement("div");
            card.className = "card-materia";
            card.innerHTML = `<h3>${nomeMateria}</h3>`;
            card.onclick = () => {
              window.location.href = `assuntos.html?id=${idEdital}&cargo=${encodeURIComponent(
                cargoSelecionado
              )}&materia=${encodeURIComponent(nomeMateria)}`;
            };
            container.appendChild(card);
          }
        }
      });
    });

  document.getElementById("voltarBtn").addEventListener("click", () => {
    window.location.href = "../index.html";
  });

  document.getElementById("sairBtn").addEventListener("click", () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        alert("Sessão encerrada!");
        window.location.href = "../index.html";
      });
  });
});

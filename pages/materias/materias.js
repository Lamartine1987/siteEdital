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

      if (!cargoSelecionado && !materiaSelecionada) {
        tituloSecao.style.display = "none";
        const grupo = document.createElement("div");
        grupo.className = "grupo-cargos";

        const subtitulo = document.createElement("h2");
        subtitulo.textContent = "Cargos";
        subtitulo.className = "titulo-cargos";

        const lista = document.createElement("div");
        lista.className = "cards-container";

        firebase.auth().onAuthStateChanged(function (user) {
          if (!user) return;

          firebase
            .database()
            .ref(`usuarios/${user.uid}/tipo`)
            .once("value")
            .then((tipoSnapshot) => {
              const tipoUsuario = tipoSnapshot.val() || "gratuito";
              const isPremium = tipoUsuario === "premium";

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

                const ref = isPremium
                  ? firebase
                      .database()
                      .ref(
                        `usuarios/${user.uid}/matriculados/${editalEncontrado.id}/${nomeCargo}`
                      )
                  : firebase
                      .database()
                      .ref(`usuarios/${user.uid}/matriculados`);

                ref.once("value").then((snapshot) => {
                  const dados = snapshot.val();
                  const jaMatriculado = isPremium
                    ? !!dados
                    : dados?.id === editalEncontrado.id &&
                      dados?.cargo === nomeCargo;

                  btn.dataset.nomeEdital = editalEncontrado.nome;
                  btn.dataset.idEdital = editalEncontrado.id;
                  btn.dataset.nomeCargo = nomeCargo;
                  btn.dataset.userId = user.uid;
                  btn.dataset.isPremium = isPremium.toString();

                  const configurarMatricular = () => {
                    btn.textContent = "Matricular";
                    btn.style.backgroundColor = "#28a745";
                    btn.style.color = "white";
                    btn.onclick = (e) => {
                      e.stopPropagation();
                      const matricula = {
                        nome: editalEncontrado.nome,
                        id: editalEncontrado.id,
                        cargo: nomeCargo,
                        dataMatricula: new Date().toISOString(),
                      };

                      const refMatricula = isPremium
                        ? firebase
                            .database()
                            .ref(
                              `usuarios/${user.uid}/matriculados/${editalEncontrado.id}/${nomeCargo}`
                            )
                        : firebase
                            .database()
                            .ref(`usuarios/${user.uid}/matriculados`);

                      refMatricula
                        .set(matricula)
                        .then(() => {
                          alert("Matriculado com sucesso!");
                          configurarDesmatricular();
                        })
                        .catch((err) => {
                          console.error("Erro ao matricular:", err);
                          alert("Erro ao matricular.");
                        });
                    };
                  };

                  const configurarDesmatricular = () => {
                    btn.textContent = "Desmatricular";
                    btn.style.backgroundColor = "#dc3545";
                    btn.style.color = "white";
                    btn.onclick = async (e) => {
                      e.stopPropagation();
                      const updates = {};
                      if (isPremium) {
                        updates[
                          `usuarios/${user.uid}/matriculados/${editalEncontrado.id}/${nomeCargo}`
                        ] = null;
                        updates[
                          `usuarios/${user.uid}/progresso/${editalEncontrado.id}/${nomeCargo}`
                        ] = null;
                      } else {
                        updates[`usuarios/${user.uid}/matriculados`] = null;
                        updates[`usuarios/${user.uid}/progresso`] = null;
                      }

                      try {
                        await firebase.database().ref().update(updates);
                        alert("Desmatriculado com sucesso!");
                        configurarMatricular();
                      } catch (err) {
                        console.error("Erro ao desmatricular:", err);
                        alert("Erro ao desmatricular.");
                      }
                    };
                  };

                  jaMatriculado
                    ? configurarDesmatricular()
                    : configurarMatricular();

                  card.appendChild(btn);
                });

                card.onclick = () => {
                  window.location.href = `paginaEditais.html?id=${idEdital}&cargo=${encodeURIComponent(
                    nomeCargo
                  )}`;
                };

                lista.appendChild(card);
              }

              grupo.appendChild(subtitulo);
              grupo.appendChild(lista);
              container.appendChild(grupo);
            });
        });
      } else if (cargoSelecionado && !materiaSelecionada) {
        tituloSecao.textContent = "Assuntos";
        tituloSecao.style.display = "block";

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
      } else if (cargoSelecionado && materiaSelecionada) {
        tituloSecao.textContent = "Assuntos";
        tituloSecao.style.display = "block";
        const cargoData = cargos[cargoSelecionado];
        const assuntos = cargoData?.materias?.[materiaSelecionada];

        if (!assuntos) {
          container.innerHTML = "<p>Assuntos não encontrados.</p>";
          return;
        }

        const card = document.createElement("div");
        card.className = "card-materia";
        card.innerHTML = `<h3>${materiaSelecionada}</h3>`;

        const lista = document.createElement("ul");
        for (const assunto of assuntos) {
          const li = document.createElement("li");
          li.textContent = assunto;
          lista.appendChild(li);
        }

        card.appendChild(lista);
        container.appendChild(card);
      }
    })
    .catch((error) => {
      console.error("Erro ao buscar dados:", error);
      titulo.textContent = "Erro ao carregar o edital.";
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

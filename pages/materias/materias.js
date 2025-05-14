document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const nomeEdital = params.get('edital');

  if (!nomeEdital) {
    document.getElementById("tituloEdital").textContent = "Nenhum edital selecionado.";
    return;
  }

  const db = firebase.firestore();
  db.collection("editais")
    .where("nome", "==", nomeEdital)
    .get()
    .then(querySnapshot => {
      if (querySnapshot.empty) {
        document.getElementById("tituloEdital").textContent = "Edital não encontrado.";
        return;
      }

      querySnapshot.forEach(doc => {
        const edital = doc.data();
        document.getElementById("tituloEdital").textContent = edital.nome;

        const container = document.getElementById("materiasContainer");
        container.innerHTML = '';

        const materias = edital.materias;

        for (const nomeMateria in materias) {
          if (materias.hasOwnProperty(nomeMateria)) {
            const card = document.createElement("div");
            card.className = "card-materia";
            card.innerHTML = `<h3>${nomeMateria}</h3>`;

            const assuntos = materias[nomeMateria];
            const lista = document.createElement("ul");

            for (const chave in assuntos) {
              if (assuntos.hasOwnProperty(chave)) {
                const li = document.createElement("li");
                li.textContent = assuntos[chave];
                lista.appendChild(li);
              }
            }

            card.appendChild(lista);
            container.appendChild(card);
          }
        }
      });
    })
    .catch(error => {
      console.error("Erro ao carregar edital:", error);
      document.getElementById("tituloEdital").textContent = "Erro ao buscar o edital.";
    });
});


/*document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const nomeEdital = params.get('edital');

    if (!nomeEdital) {
      document.getElementById("tituloEdital").textContent = "Nenhum edital selecionado.";
      return;
    }

    const db = firebase.firestore();
    db.collection("editais")
      .where("nome", "==", nomeEdital)
      .get()
      .then(querySnapshot => {
        if (querySnapshot.empty) {
          document.getElementById("tituloEdital").textContent = "Edital não encontrado.";
          return;
        }

        querySnapshot.forEach(doc => {
          const edital = doc.data();
          document.getElementById("tituloEdital").textContent = edital.nome;

          const container = document.getElementById("materiasContainer");
          container.innerHTML = '';

          const materias = edital.materias;

          for (const nomeMateria in materias) {
            if (materias.hasOwnProperty(nomeMateria)) {
              const card = document.createElement("div");
              card.className = "card-materia";
              card.innerHTML = `<h3>${nomeMateria}</h3>`;

              const assuntos = materias[nomeMateria];
              const lista = document.createElement("ul");

              for (const chave in assuntos) {
                if (assuntos.hasOwnProperty(chave)) {
                  const li = document.createElement("li");
                  li.textContent = assuntos[chave];
                  lista.appendChild(li);
                }
              }

              card.appendChild(lista);
              container.appendChild(card);
            }
          }
        });
      })
      .catch(error => {
        console.error("Erro ao carregar edital:", error);
        document.getElementById("tituloEdital").textContent = "Erro ao buscar o edital.";
      });
  });*/
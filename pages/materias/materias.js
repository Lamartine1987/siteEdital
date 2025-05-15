document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const idEdital = params.get("id")?.trim();
  const cargoSelecionado = params.get("cargo")?.trim();
  const materiaSelecionada = params.get("materia")?.trim();

  const titulo = document.getElementById("tituloEdital");
  const container = document.getElementById("materiasContainer");

  if (!idEdital) {
    titulo.textContent = "Nenhum edital selecionado.";
    return;
  }

  const db = firebase.firestore();

  db.collection("editais")
    .where("id", "==", idEdital)
    .get()
    .then(querySnapshot => {
      if (querySnapshot.empty) {
        titulo.textContent = "Edital não encontrado.";
        return;
      }

      const edital = querySnapshot.docs[0].data();
      titulo.textContent = edital.nome;
      container.innerHTML = '';

      const cargos = edital.cargo;

      if (!cargoSelecionado) {
        // 1️⃣ Exibe os cargos
        for (const grupo in cargos) {
          const subcargos = cargos[grupo];
          for (const nomeCargo in subcargos) {
            const card = document.createElement("div");
            card.className = "card-materia";
            card.innerHTML = `<h3>${nomeCargo}</h3>`;
            card.onclick = () => {
              window.location.href = `paginaEditais.html?id=${idEdital}&cargo=${nomeCargo}`;
            };
            container.appendChild(card);
          }
        }

      } else if (!materiaSelecionada) {
        // 2️⃣ Exibe as matérias do cargo
        let cargoData;
        for (const grupo in cargos) {
          if (cargos[grupo][cargoSelecionado]) {
            cargoData = cargos[grupo][cargoSelecionado];
            break;
          }
        }

        if (!cargoData || !cargoData.materias) {
          container.innerHTML = "<p>Nenhuma matéria encontrada para este cargo.</p>";
          return;
        }

        for (const nomeMateria in cargoData.materias) {
          const card = document.createElement("div");
          card.className = "card-materia";
          card.innerHTML = `<h3>${nomeMateria}</h3>`;
          card.onclick = () => {
            window.location.href = `paginaEditais.html?id=${idEdital}&cargo=${cargoSelecionado}&materia=${encodeURIComponent(nomeMateria)}`;
          };
          container.appendChild(card);
        }

      } else {
        // 3️⃣ Exibe os assuntos da matéria
        let cargoData;
        for (const grupo in cargos) {
          if (cargos[grupo][cargoSelecionado]) {
            cargoData = cargos[grupo][cargoSelecionado];
            break;
          }
        }

        const assuntos = cargoData?.materias?.[materiaSelecionada];
        if (!assuntos) {
          container.innerHTML = "<p>Assuntos não encontrados.</p>";
          return;
        }

        const card = document.createElement("div");
        card.className = "card-materia";
        card.innerHTML = `<h3>${materiaSelecionada}</h3>`;

        const lista = document.createElement("ul");
        for (const chave in assuntos) {
          const li = document.createElement("li");
          li.textContent = assuntos[chave];
          lista.appendChild(li);
        }

        card.appendChild(lista);
        container.appendChild(card);
      }
    })
    .catch(error => {
      console.error("Erro ao buscar dados:", error);
      titulo.textContent = "Erro ao carregar o edital.";
    });
});

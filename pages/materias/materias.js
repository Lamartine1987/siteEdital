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

  const db = firebase.database();

  // Percorre todos os editais para encontrar aquele com o id correto
  db.ref("editais").once("value").then(snapshot => {
    const editais = snapshot.val();
    let editalEncontrado = null;
    let chaveEdital = null;

    for (const chave in editais) {
      if (editais[chave].id === idEdital) {
        editalEncontrado = editais[chave];
        chaveEdital = chave;
        break;
      }
    }

    if (!editalEncontrado) {
      titulo.textContent = "Edital não encontrado.";
      return;
    }

    titulo.textContent = editalEncontrado.nome;
    container.innerHTML = '';

    const cargos = editalEncontrado.cargos;

    if (!cargoSelecionado) {
      // Exibe os cargos
      for (const nomeCargo in cargos) {
        const card = document.createElement("div");
        card.className = "card-materia";
        card.innerHTML = `<h3>${nomeCargo}</h3>`;
        card.onclick = () => {
          window.location.href = `paginaEditais.html?id=${idEdital}&cargo=${nomeCargo}`;
        };
        container.appendChild(card);
      }

    } else if (!materiaSelecionada) {
      // Exibe as matérias
      const cargoData = cargos[cargoSelecionado];

      if (!cargoData || !cargoData.materias) {
        container.innerHTML = "<p>Nenhuma matéria encontrada para este cargo.</p>";
        return;
      }

      for (const nomeMateria in cargoData.materias) {
        const card = document.createElement("div");
        card.className = "card-materia";
        card.innerHTML = `<h3>${nomeMateria}</h3>`;
        card.onclick = () => {
          window.location.href = `assuntos.html?id=${idEdital}&cargo=${cargoSelecionado}&materia=${encodeURIComponent(nomeMateria)}`;
        };
        container.appendChild(card);
      }

    } else {
      // Exibe os assuntos da matéria
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
  }).catch(error => {
    console.error("Erro ao buscar dados:", error);
    titulo.textContent = "Erro ao carregar o edital.";
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const idEdital = params.get("id")?.trim();
  const cargoSelecionado = params.get("cargo")?.trim();
  const materiaSelecionada = params.get("materia")?.trim();

  const titulo = document.getElementById("tituloEdital");
  const container = document.getElementById("materiasContainer");
  const tituloSecao = document.getElementById("tituloSecao"); // <-- para controlar "Assuntos"
  const breadcrumb = document.getElementById("breadcrumb");

  if (!idEdital) {
    titulo.textContent = "Nenhum edital selecionado.";
    return;
  }

  const db = firebase.database();

  db.ref("editais")
    .once("value")
    .then((snapshot) => {
      const editais = snapshot.val();
      let editalEncontrado = null;

      for (const chave in editais) {
        if (editais[chave].id === idEdital) {
          editalEncontrado = editais[chave];
          break;
        }
      }

      if (!editalEncontrado) {
        titulo.textContent = "Edital não encontrado.";
        return;
      }

      titulo.textContent = editalEncontrado.nome;

      // Breadcrumb dinâmico
      if (cargoSelecionado && materiaSelecionada) {
        breadcrumb.textContent = `Cargos › ${cargoSelecionado} › ${materiaSelecionada}`;
      } else if (cargoSelecionado) {
        breadcrumb.textContent = `Cargos › ${cargoSelecionado}`;
      } else {
        breadcrumb.textContent = `Cargos`;
      }

      container.innerHTML = '';

      const cargos = editalEncontrado.cargos;

      // === TELA DE CARGOS ===
      if (!cargoSelecionado && !materiaSelecionada) {
        tituloSecao.style.display = "none"; // Esconde "Assuntos"

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
          card.onclick = () => {
            window.location.href = `paginaEditais.html?id=${idEdital}&cargo=${nomeCargo}`;
          };
          lista.appendChild(card);
        }

        grupo.appendChild(subtitulo);
        grupo.appendChild(lista);
        container.appendChild(grupo);
      }

      // === TELA DE MATÉRIAS ===
      else if (cargoSelecionado && !materiaSelecionada) {
        tituloSecao.textContent = "Assuntos";
        tituloSecao.style.display = "block";

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
      }

      // === TELA DE ASSUNTOS ===
      else if (cargoSelecionado && materiaSelecionada) {
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
});

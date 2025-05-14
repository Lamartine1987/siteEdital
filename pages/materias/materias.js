document.addEventListener("DOMContentLoaded", function () {
  const idEdital = new URLSearchParams(window.location.search).get("id")?.trim();
  console.log("Edital ID recebido:", idEdital); // 🔍 debug

  if (!idEdital) {
    document.getElementById("tituloEdital").textContent = "Nenhum edital selecionado.";
    return;
  }

  const db = firebase.firestore();

  db.collection("editais")
    .where("id", "==", idEdital)
    .get()
    .then(querySnapshot => {
      if (querySnapshot.empty) {
        document.getElementById("tituloEdital").textContent = "Edital não encontrado.";
        return;
      }

      querySnapshot.forEach(doc => {
        const edital = doc.data();
        console.log("✅ Edital carregado:", edital); // 🔍 debug

        document.getElementById("tituloEdital").textContent = edital.nome;

        const container = document.getElementById("materiasContainer");
        container.innerHTML = '';

        const materias = edital.materias;

        for (const nomeMateria in materias) {
          if (materias.hasOwnProperty(nomeMateria)) {
            const card = document.createElement("div");
            card.className = "card-materia";

            const titulo = document.createElement("h3");
            titulo.textContent = nomeMateria.charAt(0).toUpperCase() + nomeMateria.slice(1);
            card.appendChild(titulo);

            const lista = document.createElement("ul");
            const assuntos = materias[nomeMateria];

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

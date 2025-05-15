function logout() {
  firebase
    .auth()
    .signOut()
    .then(() => (location.href = "../index.html"));
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

    // 🔎 Pega progresso
    const progressoSnap = await db
      .ref(`usuarios/${user.uid}/progresso/${idEdital}/${cargo}/${materia}`)
      .once("value");
    const progresso = progressoSnap.val() || {};

    container.innerHTML = "";

    assuntos.forEach((texto) => {
      // Cria uma chave segura e padronizada para salvar e recuperar do Firebase
      const assuntoKey = texto
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^\w]/g, "");

      const linha = document.createElement("div");
      linha.className = "assunto-row";
      if (progresso[assuntoKey]) linha.classList.add("estudado");

      const span = document.createElement("div");
      span.className = "assunto-texto";
      span.textContent = texto;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = !!progresso[assuntoKey];
      checkbox.onchange = async () => {
        await db
          .ref(
            `usuarios/${user.uid}/progresso/${idEdital}/${cargo}/${materia}/${assuntoKey}`
          )
          .set(checkbox.checked);
        linha.classList.toggle("estudado", checkbox.checked); // ✅ aplica classe visual
      };

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
      actions.appendChild(checkbox);
      actions.appendChild(editar);
      actions.appendChild(excluir);

      linha.appendChild(span);
      linha.appendChild(actions);
      container.appendChild(linha);
    });
  });
});

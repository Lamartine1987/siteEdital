function irParaCurso(idEdital) {
  const url = `materias/paginaEditais.html?id=${encodeURIComponent(idEdital)}`;
  window.location.href = url;
}


document.addEventListener('DOMContentLoaded', function () {
  const db = firebase.database();
  const container = document.getElementById('editaisContainer');
  const searchInput = document.getElementById('searchInput');
  let editais = [];

  // 🔄 Buscar editais do Firebase
  db.ref("editais").once("value").then(snapshot => {
    const data = snapshot.val();
    editais = Object.values(data);
    renderEditais(editais);

    // ✅ Filtro de busca - ativado só após carregar os dados
    searchInput.addEventListener('input', () => {
      const termo = searchInput.value.toLowerCase();
      const filtrados = editais.filter(e => e.nome.toLowerCase().includes(termo));
      renderEditais(filtrados);
    });
  });

  function renderEditais(lista) {
    container.innerHTML = '';
    lista.forEach(edital => {
      const card = document.createElement('div');
      card.className = 'edital-card';
      card.innerHTML = `
        <div class="edital-title">${edital.nome}</div>
        <div class="edital-description">${edital.descricao || ''}</div>
      `;

      card.addEventListener('click', () => {
        firebase.auth().onAuthStateChanged(function (user) {
          if (user) {
            window.location.href = `materias/paginaEditais.html?id=${encodeURIComponent(edital.id)}`;
          } else {
            const modal = document.getElementById('loginModal');
            modal.style.display = 'flex';

            const loginBtn = document.getElementById('modalLoginBtn');
            const registerBtn = document.getElementById('modalRegisterBtn');
            const closeBtn = document.getElementById('modalCloseBtn');

            if (!loginBtn.dataset.listener) {
              loginBtn.addEventListener('click', () => window.location.href = "login.html");
              loginBtn.dataset.listener = "true";
            }

            if (!registerBtn.dataset.listener) {
              registerBtn.addEventListener('click', () => window.location.href = "cadastro.html");
              registerBtn.dataset.listener = "true";
            }

            if (!closeBtn.dataset.listener) {
              closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
              });
              closeBtn.dataset.listener = "true";
            }
          }
        });
      });

      container.appendChild(card);
    });
  }

  // ✅ Meus Editais (caso use botão externo com id="meusEditaisBtn")
  const meusEditaisBtn = document.getElementById('meusEditaisBtn');
  if (meusEditaisBtn) {
    meusEditaisBtn.addEventListener('click', () => {
      const user = firebase.auth().currentUser;
      if (!user) return;

      const userId = user.uid;
      const modal = document.getElementById('modalMeusEditais');
      const lista = document.getElementById('modalMeusEditaisLista');
      lista.innerHTML = '';

      firebase.database().ref(`usuarios/${userId}`).once("value").then(snapshot => {
        const dados = snapshot.val() || {};
        const tipo = dados.tipo || "gratuito";
        const matriculados = dados.matriculados || {};

        if (["cargo", "edital", "anual"].includes(tipo)) {
          for (const idEdital in matriculados) {
            const cargos = matriculados[idEdital];
            for (const nomeCargo in cargos) {
              const div = document.createElement("div");
              div.className = "meu-edital-item";
              div.innerHTML = `
                <p><strong>${idEdital}</strong> - Cargo: <strong>${nomeCargo}</strong></p>
                <button class="btn-acessar" onclick="irParaCurso('${idEdital}', '${nomeCargo}')">Acessar</button>
              `;
              lista.appendChild(div);
            }
          }
        } else if (matriculados?.id && matriculados?.cargo) {
          const div = document.createElement("div");
          div.innerHTML = `
            <p><strong>${matriculados.id}</strong> - Cargo: <strong>${matriculados.cargo}</strong></p>
            <button class="btn-acessar" onclick="irParaCurso('${matriculados.id}', '${matriculados.cargo}')">Acessar</button>
          `;
          lista.appendChild(div);
        } else {
          lista.innerHTML = "<p>Você ainda não está matriculado em nenhum edital.</p>";
        }

        modal.style.display = "block";
      });
    });
  }
});

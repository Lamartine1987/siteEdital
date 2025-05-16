function irParaCurso(idEdital, nomeCargo) {
  const url = `materias/paginaEditais.html?id=${encodeURIComponent(idEdital)}&cargo=${encodeURIComponent(nomeCargo)}`;
  window.location.href = url;
}

document.addEventListener('DOMContentLoaded', function () {
  const db = firebase.database();
  const container = document.getElementById('editaisContainer');
  const searchInput = document.getElementById('searchInput');
  let editais = [];

  // 🔄 Buscar editais do Realtime Database
  db.ref("editais").once("value").then(snapshot => {
    const data = snapshot.val();
    editais = Object.values(data);
    renderEditais(editais);
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

            // ✅ Adiciona listeners apenas uma vez
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

  searchInput.addEventListener('input', () => {
    const termo = searchInput.value.toLowerCase();
    const filtrados = editais.filter(e => e.nome.toLowerCase().includes(termo));
    renderEditais(filtrados);
  });
});

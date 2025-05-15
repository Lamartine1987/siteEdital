document.addEventListener('DOMContentLoaded', function () {
  const db = firebase.database(); // ✅ Realtime DB
  const container = document.getElementById('editaisContainer');
  const searchInput = document.getElementById('searchInput');
  let editais = [];

  // 🔄 Buscar editais do Realtime Database
  db.ref("editais").once("value").then(snapshot => {
    const data = snapshot.val();

    // Transforma objeto em array
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
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
            window.location.href = `materias/paginaEditais.html?id=${encodeURIComponent(edital.id)}`;
          } else {
            document.getElementById('loginModal').style.display = 'flex';

            // Redirecionamento dos botões do modal
            document.getElementById('modalLoginBtn').addEventListener('click', () => {
              window.location.href = "login.html";
            });

            document.getElementById('modalRegisterBtn').addEventListener('click', () => {
              window.location.href = "cadastro.html";
            });

            document.getElementById('modalCloseBtn').addEventListener('click', () => {
              document.getElementById('loginModal').style.display = 'none';
            });
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

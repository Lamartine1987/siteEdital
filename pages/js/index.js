document.addEventListener('DOMContentLoaded', function () {

  db.collection("editais").get().then(querySnapshot => {
    editais = querySnapshot.docs.map(doc => doc.data());
    renderEditais(editais);
  });

  const container = document.getElementById('editaisContainer');
  const searchInput = document.getElementById('searchInput');

  function renderEditais(lista) {
    container.innerHTML = '';
    lista.forEach(edital => {
      const card = document.createElement('div');
      card.className = 'edital-card';
      card.innerHTML = `
        <div class="edital-title">${edital.nome}</div>
        <div class="edital-description">${edital.descricao}</div>
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

  function buscar() {
    const termo = searchInput.value.toLowerCase();
    const filtrados = editais.filter(e => e.nome.toLowerCase().includes(termo));
    renderEditais(filtrados);
  }

  searchInput.addEventListener('input', () => {
    const termo = searchInput.value.toLowerCase();
    const filtrados = editais.filter(e => e.nome.toLowerCase().includes(termo));
    renderEditais(filtrados);
  });

  /*renderEditais(editais);*/
});

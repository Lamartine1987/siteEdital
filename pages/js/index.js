document.addEventListener('DOMContentLoaded', function () {
  const editais = [
    { nome: "Prefeitura 2024", descricao: "Concurso municipal para diversos cargos.", link: "assuntos.html?edital=Prefeitura%202024" },
    { nome: "Banco Central 2025", descricao: "Concurso nacional para o Banco Central.", link: "assuntos.html?edital=Banco%20Central%202025" },
    { nome: "TRT 2024", descricao: "Tribunal Regional do Trabalho 2024.", link: "assuntos.html?edital=TRT%202024" },
    { nome: "Polícia Civil 2025", descricao: "Concurso da Polícia Civil em 2025.", link: "assuntos.html?edital=Policia%20Civil%202025" },
    { nome: "Receita Federal 2025", descricao: "Concurso para a Receita Federal 2025.", link: "assuntos.html?edital=Receita%20Federal%202025" },
    { nome: "Concurso MPU", descricao: "Ministério Público da União - Edital Especial.", link: "paginaMpu.html?edital=Concurso%20MPU" }
  ];

  const container = document.getElementById('editaisContainer');
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');

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
            window.location.href = edital.link;
          } else {
            document.getElementById('loginModal').style.display = 'flex';
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

  searchButton.addEventListener('click', buscar);
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') buscar();
  });

  renderEditais(editais);

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
});

document.addEventListener('DOMContentLoaded', function() {
  const params = new URLSearchParams(window.location.search);
const edital = params.get('edital');

// Mapeamento de nomes personalizados
const nomesEditais = {
  "concurso mpu": "Ministério Público da União",
  "prefeitura 2024": "Prefeitura Municipal 2024",
  "banco central 2025": "Banco Central do Brasil 2025",
  "trt 2024": "Tribunal Regional do Trabalho 2024",
  "policia civil 2025": "Polícia Civil 2025",
  "receita federal 2025": "Receita Federal do Brasil 2025"
};

let titulo = "Assuntos de Concurso";

if (edital) {
  const editalDecoded = decodeURIComponent(edital).toLowerCase();
  titulo = nomesEditais[editalDecoded] || decodeURIComponent(edital);
}

document.getElementById('tituloConcurso').innerText = titulo;


document.getElementById('tituloConcurso').innerText = titulo;

  document.getElementById('tituloConcurso').innerText = titulo.split(' ')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  .join(' ');


  const data = [
    { categoria: "Gestão de Processos", assuntos: ["Introdução à Gestão de Processos", "Modelagem de Processos", "Análise de Processos", "Melhoria de Processos"] },
    { categoria: "Inteligência Artificial e Big Data", assuntos: ["Conceitos de IA", "Machine Learning", "Deep Learning", "Chatbots e Assistentes Virtuais"] },
    { categoria: "Desenvolvimento Mobile", assuntos: ["Android", "iOS", "React Native"] },
    { categoria: "Servidores Web e Aplicações", assuntos: ["Nginx", "Apache", "Node.js", "Tomcat"] },
    { categoria: "Armazenamento de Objetos", assuntos: ["MinIO", "Amazon S3", "Google Cloud Storage"] },
    { categoria: "Ferramentas de Design / Prototipação", assuntos: ["Figma", "Balsamiq", "Adobe XD"] },
    { categoria: "Robotic Process Automation (RPA)", assuntos: ["Automação de processos", "UiPath", "Automation Anywhere"] },
    { categoria: "Outros Assuntos Técnicos", assuntos: ["COBIT", "BPMN", "Data Governance", "Data Modeling"] }
  ];

  function createCards() {
    const container = document.getElementById('cardsContainer');
    const menu = document.getElementById('menuCategorias');
    container.innerHTML = '';
    menu.innerHTML = '';

    data.forEach((item, index) => {
      const li = document.createElement('li');
      li.textContent = item.categoria;
      li.onclick = () => {
        document.getElementById('cat' + index).scrollIntoView({ behavior: 'smooth' });
      };
      menu.appendChild(li);

      const card = document.createElement('div');
      card.className = 'card';
      card.id = 'cat' + index;

      const header = document.createElement('div');
      header.className = 'card-header';

      const h2 = document.createElement('h2');
      h2.innerText = item.categoria;

      const buttonsDiv = document.createElement('div');
      buttonsDiv.className = 'card-header-buttons';

      const editBtn = document.createElement('button');
      editBtn.className = 'edit-category-btn';
      editBtn.innerHTML = '✏️';
      editBtn.title = 'Editar Categoria';
      editBtn.onclick = () => editCategoria(index);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-category-btn';
      deleteBtn.innerHTML = '🗑️';
      deleteBtn.title = 'Excluir Categoria';
      deleteBtn.onclick = () => deleteCategoria(index);

      buttonsDiv.appendChild(editBtn);
      buttonsDiv.appendChild(deleteBtn);

      header.appendChild(h2);
      header.appendChild(buttonsDiv);

      card.appendChild(header);

      const table = document.createElement('table');
      const thead = document.createElement('thead');
      thead.innerHTML = '<tr><th>Nº</th><th>Assunto</th><th>Estudado</th><th>Ações</th></tr>';
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      item.assuntos.forEach((assunto, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${idx + 1}</td>
          <td>${assunto}</td>
          <td><input type="checkbox" class="estudado-checkbox"></td>
          <td class="actions">
            <button class="edit" title="Editar">✏️</button>
            <button class="delete" title="Excluir">🗑️</button>
          </td>`;
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      card.appendChild(table);
      container.appendChild(card);
    });

    setupCheckbox();
    setupButtons();
  }

  function setupCheckbox() {
    document.querySelectorAll('.estudado-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        const tr = this.closest('tr');
        tr.style.backgroundColor = this.checked ? "#d4edda" : "";
      });
    });
  }

  function setupButtons() {
    document.querySelectorAll('.delete').forEach(button => {
      button.onclick = function() {
        const row = this.closest('tr');
  
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
          <div class="modal-content">
            <h3>Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir este assunto?</p>
            <div class="modal-buttons">
              <button id="confirmDeleteBtn" class="confirm-btn">Excluir</button>
              <button id="cancelDeleteBtn" class="cancel-btn">Cancelar</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
  
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
          row.classList.add('fade-out');
          setTimeout(() => {
            row.remove();
          }, 500);
          closeModal();
        });
  
        document.getElementById('cancelDeleteBtn').addEventListener('click', closeModal);
      };
    });
  
    document.querySelectorAll('.edit').forEach(button => {
      button.onclick = function() {
        const row = this.closest('tr');
        const assuntoCell = row.cells[1];
        const oldName = assuntoCell.textContent;
  
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
          <div class="modal-content">
            <h3>Editar Assunto</h3>
            <input id="editAssuntoName" value="${oldName}">
            <div class="modal-buttons">
              <button id="confirmEditAssuntoBtn" class="confirm-btn">Salvar</button>
              <button id="cancelEditAssuntoBtn" class="cancel-btn">Cancelar</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
  
        document.getElementById('confirmEditAssuntoBtn').addEventListener('click', () => {
          const newName = document.getElementById('editAssuntoName').value.trim();
          if (newName) {
            assuntoCell.textContent = newName;
            closeModal();
          } else {
            alert("Preencha o nome do assunto.");
          }
        });
  
        document.getElementById('cancelEditAssuntoBtn').addEventListener('click', closeModal);
      };
    });
  }
  

  function openAddModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Novo Assunto</h3>
        <input id="newAssuntoName" placeholder="Nome do assunto">
        <select id="newAssuntoCategory">
          ${data.map((d, idx) => `<option value="${idx}">${d.categoria}</option>`).join('')}
        </select>
        <div class="modal-buttons">
          <button id="confirmAddBtn" class="confirm-btn">Adicionar</button>
          <button id="cancelAddBtn" class="cancel-btn">Cancelar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('confirmAddBtn').addEventListener('click', addNewAssunto);
    document.getElementById('cancelAddBtn').addEventListener('click', closeModal);
  }

  function addNewAssunto() {
    const name = document.getElementById('newAssuntoName').value.trim();
    const categoryIndex = parseInt(document.getElementById('newAssuntoCategory').value);
    
    if (name && !isNaN(categoryIndex)) {
      data[categoryIndex].assuntos.push(name);
      closeModal();
      createCards();

      setTimeout(() => {
        const cards = document.querySelectorAll('.card');
        const lastCard = cards[categoryIndex];
        const lastRow = lastCard.querySelector('tbody tr:last-child');
        lastRow.classList.add('fade-in');
      }, 50);
    } else {
      alert("Preencha o nome do assunto corretamente.");
    }
  }

  function openAddCategoriaModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Nova Categoria</h3>
        <input id="newCategoriaName" placeholder="Nome da categoria">
        <div class="modal-buttons">
          <button id="confirmAddCategoriaBtn" class="confirm-btn">Adicionar</button>
          <button id="cancelAddCategoriaBtn" class="cancel-btn">Cancelar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('confirmAddCategoriaBtn').addEventListener('click', addNewCategoria);
    document.getElementById('cancelAddCategoriaBtn').addEventListener('click', closeModal);
  }

  function addNewCategoria() {
    const name = document.getElementById('newCategoriaName').value.trim();
    
    if (name) {
      data.push({ categoria: name, assuntos: [] });
      closeModal();
      createCards();

      setTimeout(() => {
        const cards = document.querySelectorAll('.card');
        const lastCard = cards[cards.length - 1];
        lastCard.classList.add('fade-in');
      }, 50);
    } else {
      alert("Preencha o nome da categoria corretamente.");
    }
  }

  function editCategoria(index) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Editar Categoria</h3>
        <input id="editCategoriaName" value="${data[index].categoria}">
        <div class="modal-buttons">
          <button id="confirmEditCategoriaBtn" class="confirm-btn">Salvar</button>
          <button id="cancelEditCategoriaBtn" class="cancel-btn">Cancelar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('confirmEditCategoriaBtn').addEventListener('click', () => {
      const newName = document.getElementById('editCategoriaName').value.trim();
      if (newName) {
        data[index].categoria = newName;
        closeModal();
        createCards();
      } else {
        alert('Preencha o nome da categoria.');
      }
    });

    document.getElementById('cancelEditCategoriaBtn').addEventListener('click', closeModal);
  }

  function deleteCategoria(index) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Excluir Categoria</h3>
        <p>Tem certeza que deseja excluir a categoria "<strong>${data[index].categoria}</strong>"?</p>
        <div class="modal-buttons">
          <button id="confirmDeleteCategoriaBtn" class="confirm-btn">Excluir</button>
          <button id="cancelDeleteCategoriaBtn" class="cancel-btn">Cancelar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('confirmDeleteCategoriaBtn').addEventListener('click', () => {
      const cards = document.querySelectorAll('.card');
      const cardToRemove = cards[index];
      cardToRemove.classList.add('fade-out');
      setTimeout(() => {
        data.splice(index, 1);
        createCards();
      }, 500);
      closeModal();
    });

    document.getElementById('cancelDeleteCategoriaBtn').addEventListener('click', closeModal);
  }

  function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();
  }

  // Inicializar tudo
  createCards();

  document.getElementById('newAssuntoBtn').addEventListener('click', openAddModal);
  document.getElementById('newCategoriaBtn').addEventListener('click', openAddCategoriaModal);

  document.getElementById('clearSearch').addEventListener('click', () => {
    const input = document.getElementById('searchInput');
    input.value = '';
    input.dispatchEvent(new Event('input'));
  });

  document.getElementById('searchInput').addEventListener('input', function() {
    const search = this.value.toLowerCase();
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      const rows = card.querySelectorAll('tbody tr');
      let hasMatch = false;
      rows.forEach(row => {
        const assunto = row.cells[1].textContent.toLowerCase();
        row.style.display = assunto.includes(search) ? '' : 'none';
        if (assunto.includes(search)) hasMatch = true;
      });
      card.style.display = hasMatch || search === '' ? '' : 'none';
    });
  });
});

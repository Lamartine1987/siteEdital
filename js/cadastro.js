document.addEventListener('DOMContentLoaded', function () {
  const auth = firebase.auth();
  const nome = document.getElementById('nome');
  const email = document.getElementById('email');
  const senha = document.getElementById('senha');
  const confirmarSenha = document.getElementById('confirmarSenha');
  const cadastrarBtn = document.getElementById('cadastrarBtn');

  cadastrarBtn.addEventListener('click', () => {
    const nomeVal = nome.value.trim();
    const emailVal = email.value.trim();
    const senhaVal = senha.value;
    const confirmarVal = confirmarSenha.value;

    if (!nomeVal || !emailVal || !senhaVal || !confirmarVal) {
      alert("Preencha todos os campos.");
      return;
    }

    if (senhaVal !== confirmarVal) {
      alert("As senhas não coincidem.");
      return;
    }

    // Desativa o botão durante o processo
    cadastrarBtn.disabled = true;
    cadastrarBtn.textContent = "Aguarde...";

    auth.createUserWithEmailAndPassword(emailVal, senhaVal)
      .then(userCredential => {
        return userCredential.user.updateProfile({
          displayName: nomeVal
        });
      })
      .then(() => {
        alert("Cadastro realizado com sucesso!");
        window.location.href = "../pages/index.html";
      })
      .catch(error => {
        alert("Erro ao cadastrar: " + error.message);
      })
      .finally(() => {
        cadastrarBtn.disabled = false;
        cadastrarBtn.textContent = "Cadastrar";
      });
  });

  document.getElementById('cancelarBtn').addEventListener('click', () => {
    window.location.href = "../pages/index.html";
  });
    
});

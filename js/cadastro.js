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
  
      auth.createUserWithEmailAndPassword(emailVal, senhaVal)
        .then(userCredential => {
          return userCredential.user.updateProfile({
            displayName: nomeVal
          });
        })
        .then(() => {
          alert("Cadastro realizado com sucesso!");
          window.location.href = "index.html";
        })
        .catch(error => {
          alert("Erro ao cadastrar: " + error.message);
        });
    });
  });
  
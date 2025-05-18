document.addEventListener('DOMContentLoaded', function () {
  const auth = firebase.auth();
  const db = firebase.database(); // ⬅️ Importante: adicionar acesso ao database

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

    cadastrarBtn.disabled = true;
    cadastrarBtn.textContent = "Aguarde...";

    auth.createUserWithEmailAndPassword(emailVal, senhaVal)
      .then(userCredential => {
        const user = userCredential.user;

        // Atualiza o nome exibido no perfil
        return user.updateProfile({
          displayName: nomeVal
        }).then(() => {
          // Salva no Realtime Database com tipo "gratuito"
          return db.ref("usuarios/" + user.uid).set({
            nome: nomeVal,
            email: emailVal,
            tipo: "gratuito",
            dataCadastro: new Date().toISOString()
          });
        });
      })
      .then(() => {
        alert("Cadastro realizado com sucesso!");
        window.location.href = "./index.html";
      })
      .catch(error => {
        console.error("Erro ao cadastrar:", error);
        alert("Erro ao cadastrar: " + error.message);
      })
      .finally(() => {
        cadastrarBtn.disabled = false;
        cadastrarBtn.textContent = "Cadastrar";
      });
  });

  document.getElementById('cancelarBtn').addEventListener('click', () => {
    window.location.href = "./index.html";
  });
});

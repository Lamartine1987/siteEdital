document.addEventListener('DOMContentLoaded', function () {
    const auth = firebase.auth();
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const authBtn = document.getElementById('authBtn');
    const toggle = document.getElementById('toggleMode');
    const title = document.getElementById('formTitle');
  
    let isLoginMode = true;
  
    authBtn.addEventListener('click', () => {
      const userEmail = email.value.trim();
      const userPassword = password.value;
  
      if (!userEmail || !userPassword) {
        alert("Preencha todos os campos.");
        return;
      }
  
      if (isLoginMode) {
        auth.signInWithEmailAndPassword(userEmail, userPassword)
          .then(() => {
            alert("Login realizado!");
            window.location.href = "index.html";
          })
          .catch(err => alert("Erro no login: " + err.message));
      } else {
        auth.createUserWithEmailAndPassword(userEmail, userPassword)
          .then(() => {
            alert("Cadastro realizado!");
            window.location.href = "index.html";
          })
          .catch(err => alert("Erro no cadastro: " + err.message));
      }
    });
  
    toggle.addEventListener('click', () => {
      isLoginMode = !isLoginMode;
      title.innerText = isLoginMode ? "Login" : "Cadastro";
      authBtn.innerText = isLoginMode ? "Entrar" : "Cadastrar";
      toggle.innerText = isLoginMode ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça login";
    });
  });
  
/**document.addEventListener('DOMContentLoaded', function () {
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
            window.location.href = "../pages/index.html";
          })
          .catch(err => alert("Erro no login: " + err.message));
      } else {
        auth.createUserWithEmailAndPassword(userEmail, userPassword)
          .then(() => {
            alert("Cadastro realizado!");
            window.location.href = "../pages/index.html";
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

    document.getElementById('esqueciSenhaLink').addEventListener('click', () => {
      const userEmail = document.getElementById('email').value.trim();
    
      if (!userEmail) {
        alert("Digite seu e-mail para recuperar a senha.");
        return;
      }
    
      firebase.auth().sendPasswordResetEmail(userEmail)
        .then(() => {
          alert("E-mail de recuperação enviado. Verifique sua caixa de entrada.");
        })
        .catch(error => {
          alert("Erro ao enviar e-mail de recuperação: " + error.message);
        });
    });

    document.getElementById('cancelarBtn').addEventListener('click', () => {
      window.location.href = "../pages/index.html";
    });
    
    
  });**/

  document.addEventListener('DOMContentLoaded', function () {
    const auth = firebase.auth();
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const authBtn = document.getElementById('authBtn');
    const toggle = document.getElementById('toggleMode');
    const title = document.getElementById('formTitle');
  
    authBtn.addEventListener('click', () => {
      const userEmail = email.value.trim();
      const userPassword = password.value;
  
      if (!userEmail || !userPassword) {
        alert("Preencha todos os campos.");
        return;
      }
  
      auth.signInWithEmailAndPassword(userEmail, userPassword)
        .then(() => {
          alert("Login realizado!");
          window.location.href = "./index.html";
        })
        .catch(err => alert("Erro no login: " + err.message));
    });
  
    // ✅ Redirecionar para a página de cadastro
    toggle.addEventListener('click', () => {
      window.location.href = "cadastro.html";
    });
  
    document.getElementById('esqueciSenhaLink').addEventListener('click', () => {
      const userEmail = email.value.trim();
  
      if (!userEmail) {
        alert("Digite seu e-mail para recuperar a senha.");
        return;
      }
  
      firebase.auth().sendPasswordResetEmail(userEmail)
        .then(() => {
          alert("E-mail de recuperação enviado. Verifique sua caixa de entrada.");
        })
        .catch(error => {
          alert("Erro ao enviar e-mail de recuperação: " + error.message);
        });
    });
  
    document.getElementById('cancelarBtn').addEventListener('click', () => {
      window.location.href = "./index.html";
    });
  });
  
  
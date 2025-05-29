document.addEventListener("DOMContentLoaded", async () => {
  const painel = document.getElementById("painelEstatisticas");

  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "../index.html";
      return;
    }

    const userId = user.uid;
    const db = firebase.database();

    const tempoSnap = await db.ref(`usuarios/${userId}/tempoEstudo`).once("value");
    const tempoEstudo = tempoSnap.val() || {};

    let totalSegundos = 0;

    for (const edital in tempoEstudo) {
      for (const cargo in tempoEstudo[edital]) {
        for (const materia in tempoEstudo[edital][cargo]) {
          for (const assunto in tempoEstudo[edital][cargo][materia]) {
            totalSegundos += tempoEstudo[edital][cargo][materia][assunto].tempo || 0;
          }
        }
      }
    }

    const formatar = s => {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const ss = s % 60;
      return `${h}h ${m}m ${ss}s`;
    };

    painel.innerHTML = `
      <div class="estatistica-box">
        <h3>⏱️ Total de Tempo Estudado</h3>
        <p>${formatar(totalSegundos)}</p>
      </div>
    `;
  });
});

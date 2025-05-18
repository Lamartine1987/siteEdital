function temAcesso(userId, editalId, cargo) {
  return firebase.database().ref(`usuarios/${userId}`).once('value').then(snapshot => {
    const usuario = snapshot.val();
    const tipo = usuario?.tipo;

    // Acesso total
    if (tipo === 'anual') return true;

    // Acesso por edital (todos os cargos desse edital)
    if (tipo === 'edital') {
      return !!usuario.matriculados?.[editalId];
    }

    // Acesso por cargo específico de um edital
    if (tipo === 'cargo') {
      return !!usuario.matriculados?.[editalId]?.[cargo];
    }

    // Gratuito ou tipo não definido = sem acesso
    return false;
  });
}

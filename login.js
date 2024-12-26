const usuarioLogado = sessionStorage.getItem('usuario');

if (usuarioLogado) {
    // Converte a string JSON de volta para um objeto
    const usuario = JSON.parse(usuarioLogado);
    
    // Exibe os dados do usuário no console
    console.log('Usuário logado:', usuario.user);
    let user = usuario.user;
    // Exemplo: exibir o nome do usuário em um elemento HTML
    const usuarioNomeDiv = document.querySelector('.username');
    if (usuarioNomeDiv) {
        usuarioNomeDiv.textContent = `${user.usuario}`; // Supondo que o servidor retorne um campo "nome"
    }
} else {
    console.warn('Nenhum usuário encontrado na sessionStorage.');
    // Redireciona para a página de login, se necessário
    window.location.href = '../html/login.html';
}
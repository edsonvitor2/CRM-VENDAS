class User {
    constructor() {
        // Obter os dados do usuário no momento da criação
        this.usuarioLogado = this.obterUsuario();
    }

    obterUsuario() {
        const usuarioLogado = sessionStorage.getItem('usuario');

        if (usuarioLogado) {
            // Converte a string JSON de volta para um objeto
            const usuario = JSON.parse(usuarioLogado);

            // Exibe os dados do usuário no console
            console.log('Usuário logado:', usuario.user);

            // Atualiza o nome do usuário no HTML, se necessário
            const usuarioNomeDiv = document.querySelector('.username');
            if (usuarioNomeDiv) {
                usuarioNomeDiv.textContent = `${usuario.user.usuario}`; // Supondo que o servidor retorne um campo "usuario"
            }

            return usuario;
        } else {
            console.warn('Nenhum usuário encontrado na sessionStorage.');
            // Redireciona para a página de login, se necessário
            window.location.href = './login.html';
            return null;
        }
    }
}

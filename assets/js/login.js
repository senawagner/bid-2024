class LoginController {
    constructor() {
        Logger.info('Inicializando LoginController');
        this.initializeListeners();
    }

    initializeListeners() {
        const form = document.getElementById('formLogin');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
            Logger.debug('Listener de submit adicionado ao form');
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        const btnSubmit = event.target.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
        
        try {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            Logger.debug('Tentando login com:', { username });

            const response = await axios.post('../api/auth/login.php', {
                username,
                password
            });

            if (response.data.success) {
                Logger.info('Login realizado com sucesso');
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
                window.location.href = 'dashboard.html';
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            Logger.error('Erro no login:', error);
            Toast.error(error.response?.data?.message || 'Erro ao conectar com o servidor');
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = 'Entrar';
        }
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    new LoginController();
}); 
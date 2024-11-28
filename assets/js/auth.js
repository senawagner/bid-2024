const Auth = {
    debug: true, // Habilita logs detalhados
    
    log(...args) {
        if (this.debug) {
            Logger.info('[Auth]', ...args);
        }
    },

    error(...args) {
        Logger.error('[Auth]', ...args);
    },

    get token() {
        const token = localStorage.getItem('token');
        this.log('Token atual:', token ? 'Presente' : 'Ausente');
        return token;
    },
    
    get usuario() {
        try {
            const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
            this.log('Usuário atual:', usuario ? usuario.username : 'Nenhum');
            return usuario;
        } catch (e) {
            this.error('Erro ao ler usuário do localStorage:', e);
            return null;
        }
    },

    async verificarAuth() {
        this.log('=== Iniciando verificação de autenticação ===');
        
        const currentPath = window.location.pathname;
        const isLoginPage = currentPath.includes('login.html');
        
        this.log({
            currentPath,
            isLoginPage,
            hasToken: !!this.token,
            hasUser: !!this.usuario
        });
        
        if (!this.token || !this.usuario) {
            this.log('Token ou usuário não encontrado');
            if (!isLoginPage) {
                Toast.warning('Sua sessão expirou. Por favor, faça login novamente.');
                this.log('Redirecionando para login...');
                window.location.href = '../pages/login.html';
            }
            return false;
        }

        try {
            // Decodifica o token (base64)
            const tokenData = JSON.parse(atob(this.token));
            this.log('Dados do token:', {
                ...tokenData,
                exp: new Date(tokenData.exp * 1000).toLocaleString(),
                now: new Date().toLocaleString()
            });
            
            // Verifica se o token expira em menos de 1 minuto
            const now = Date.now() / 1000;
            const expiraEm = tokenData.exp - now;
            
            this.log('Token expira em:', {
                segundos: expiraEm,
                minutos: expiraEm / 60,
                horas: expiraEm / 3600
            });
            
            if (expiraEm < 60) { // Se expira em menos de 1 minuto
                this.error('Token próximo de expirar ou expirado', {
                    expiration: new Date(tokenData.exp * 1000).toLocaleString(),
                    now: new Date(now * 1000).toLocaleString()
                });
                Toast.warning('Sua sessão está expirando. Por favor, faça login novamente.');
                await this.logout();
                return false;
            }

            if (isLoginPage) {
                this.log('Usuário já autenticado, redirecionando para dashboard...');
                window.location.href = '../pages/dashboard.html';
                return true;
            }

            // Atualiza o nome do usuário na interface
            if (this.usuario && this.usuario.nome) {
                document.getElementById('userName').textContent = this.usuario.nome;
            }

            this.log('=== Verificação de autenticação concluída com sucesso ===');
            return true;
        } catch (e) {
            this.error('Erro ao verificar token:', e);
            Toast.error('Erro ao verificar autenticação. Por favor, faça login novamente.');
            await this.logout();
            return false;
        }
    },

    async logout() {
        this.log('Realizando logout');
        try {
            localStorage.clear();
            Toast.info('Logout realizado com sucesso');
            window.location.href = '../pages/login.html';
        } catch (e) {
            this.error('Erro ao realizar logout:', e);
            Toast.error('Erro ao realizar logout');
        }
    },

    setupAxiosInterceptors() {
        axios.interceptors.request.use(
            (config) => {
                this.log('Interceptando requisição:', config.url);
                const token = this.token;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                this.error('Erro na requisição:', error);
                Toast.error('Erro ao realizar requisição ao servidor');
                return Promise.reject(error);
            }
        );

        axios.interceptors.response.use(
            (response) => {
                this.log('Resposta recebida:', response.config.url);
                return response;
            },
            async (error) => {
                this.error('Erro na resposta:', error);
                
                if (error.response && error.response.status === 401) {
                    Toast.warning('Sua sessão expirou. Por favor, faça login novamente.');
                    await this.logout();
                } else {
                    Toast.error('Erro ao processar resposta do servidor');
                }
                
                return Promise.reject(error);
            }
        );
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    Auth.log('=== Inicializando Auth ===');
    Auth.setupAxiosInterceptors();
    
    // Atualiza o nome do usuário se estiver disponível
    if (Auth.usuario && Auth.usuario.nome) {
        document.getElementById('userName').textContent = Auth.usuario.nome;
    }
    Auth.verificarAuth();
});
const Auth = {
    debug: true,
    
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

    getUserName() {
        const usuario = this.usuario;
        return usuario ? usuario.username : 'Usuário';
    },

    async verificarAuth() {
        this.log('=== Iniciando verificação de autenticação ===');
        
        const currentPath = window.location.pathname;
        const isLoginPage = currentPath.includes('login.html');
        
        this.log('Contexto:', {
            currentPath,
            isLoginPage,
            hasToken: !!this.token,
            hasUser: !!this.usuario,
            token: this.token,
            usuario: this.usuario
        });
        
        if (!this.token || !this.usuario) {
            this.log('Sem token ou usuário - redirecionando para login');
            if (!isLoginPage) {
                window.location.href = '/pages/login.html';
            }
            return false;
        }

        try {
            const response = await axios.get('/api/v1/auth/verificar');
            this.log('Verificação bem sucedida:', response.data);
            
            if (isLoginPage) {
                window.location.href = '/pages/dashboard.html';
            }
            
            return true;
        } catch (error) {
            this.error('Erro na verificação:', error);
            
            // Se o erro for de autenticação, limpa os dados e redireciona
            if (error.response && error.response.status === 401) {
                this.logout();
                if (!isLoginPage) {
                    window.location.href = '/pages/login.html';
                }
            }
            
            return false;
        }
    },

    logout() {
        this.log('Realizando logout');
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/pages/login.html';
    },

    setupAxiosInterceptors() {
        this.log('Configurando interceptadores do Axios');
        
        // Interceptador de requisição
        axios.interceptors.request.use(
            (config) => {
                const token = this.token;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                this.error('Erro no interceptador de requisição:', error);
                return Promise.reject(error);
            }
        );

        // Interceptador de resposta
        axios.interceptors.response.use(
            (response) => {
                return response;
            },
            (error) => {
                this.error('Erro no interceptador de resposta:', error);
                
                // Se o erro for de autenticação, faz logout
                if (error.response && error.response.status === 401) {
                    this.logout();
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
    Auth.verificarAuth();
});

// Exporta o objeto Auth como default
export default Auth;
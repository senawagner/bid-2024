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
            this.error('Autenticação falhou: Token ou usuário não encontrado');
            if (!isLoginPage) {
                Toast.warning('Sua sessão expirou. Por favor, faça login novamente.');
                this.log('Redirecionando para login...');
                window.location.href = '../pages/login.html';
            }
            return false;
        }

        try {
            this.log('Verificando token no servidor...');
            const response = await axios.post('../api/auth/verificar.php', null, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            this.log('Resposta do servidor:', response.data);
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Falha na verificação do token');
            }
            
            this.log('=== Verificação de autenticação concluída com sucesso ===');
            return true;
            
        } catch (error) {
            this.error('Erro na verificação:', error.response?.data || error.message);
            
            if (!isLoginPage) {
                Toast.error('Erro de autenticação: ' + (error.response?.data?.message || error.message));
                this.log('Redirecionando para login devido a erro...');
                window.location.href = '../pages/login.html';
            }
            return false;
        }
    },

    logout() {
        this.log('=== Iniciando logout ===');
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        this.log('Token e usuário removidos');
        window.location.href = '../pages/login.html';
    },

    setupAxiosInterceptors() {
        this.log('=== Configurando interceptadores do Axios ===');
        
        axios.interceptors.request.use(
            (config) => {
                this.log('Interceptando requisição:', config.url);
                const token = this.token;
                if (token) {
                    this.log('Adicionando token à requisição');
                    config.headers.Authorization = `Bearer ${token}`;
                } else {
                    this.log('Nenhum token disponível para a requisição');
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
                this.log('Resposta recebida:', {
                    url: response.config.url,
                    status: response.status,
                    data: response.data
                });
                return response;
            },
            async (error) => {
                this.error('Erro na resposta:', {
                    url: error.config?.url,
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
                
                if (error.response?.status === 401) {
                    Toast.warning('Sua sessão expirou. Por favor, faça login novamente.');
                    await this.logout();
                } else {
                    Toast.error('Erro ao processar resposta do servidor');
                }
                
                return Promise.reject(error);
            }
        );
        
        this.log('=== Interceptadores configurados com sucesso ===');
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    Auth.log('=== Inicializando Auth ===');
    Auth.setupAxiosInterceptors();
    Auth.verificarAuth();
});

export default Auth;
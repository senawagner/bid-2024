// Verifica autenticação
// Auth.verificarAuth();

// Carrega o nome do usuário
// document.getElementById('userName').textContent = Auth.getUserName();

// Função para carregar dados do dashboard
async function carregarDados() {
    try {
        Logger.info('Carregando dados do dashboard...');
        
        const response = await axios.get('../api/v1/dashboard/stats');
        const data = response.data;
        
        if (!data.success) {
            throw new Error(data.message || 'Erro ao carregar dados');
        }
        
        // Atualiza os totais
        const stats = data.data;
        document.getElementById('totalClientes').textContent = stats.totalClientes || 0;
        document.getElementById('totalContratos').textContent = stats.totalContratos || 0;
        document.getElementById('totalOrdens').textContent = stats.totalOrdens || 0;
        document.getElementById('totalFaturas').textContent = stats.totalFaturas || 0;
        
        Logger.info('Dados do dashboard carregados com sucesso');
    } catch (error) {
        Logger.error('Erro ao carregar dados do dashboard:', error);
        if (error.response?.status === 401) {
            Auth.verificarAuth();
        } else {
            Toast.error('Erro ao carregar dados do dashboard');
        }
    }
}

// Função para carregar eventos do calendário
async function carregarEventos() {
    try {
        Logger.info('Carregando eventos do calendário...');
        
        const response = await axios.get('../api/v1/dashboard/events');
        const data = response.data;
        
        if (!data.success) {
            throw new Error(data.message || 'Erro ao carregar eventos');
        }
        
        // Atualiza os eventos do calendário
        if (window.calendar) {
            window.calendar.events = data.data;
            window.calendar.render();
            Logger.info('Eventos do calendário carregados com sucesso');
        } else {
            throw new Error('Calendário não inicializado');
        }
    } catch (error) {
        Logger.error('Erro ao carregar eventos do calendário:', error);
        if (error.response?.status === 401) {
            Auth.verificarAuth();
        } else {
            Toast.error('Erro ao carregar eventos do calendário');
        }
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    try {
        Logger.info('Iniciando dashboard...');
        
        // Espera o Auth estar disponível
        let attempts = 0;
        while (!window.Auth && attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (!window.Auth) {
            throw new Error('Módulo Auth não carregado após 1 segundo');
        }

        // Verifica autenticação
        const authResult = await window.Auth.verificarAuth();
        if (!authResult) {
            Logger.error('Falha na autenticação');
            return;
        }

        // Carrega o nome do usuário
        document.getElementById('userName').textContent = window.Auth.getUserName();

        // Carrega dados iniciais
        await carregarDados();
        await carregarEventos();
        
        Logger.info('Dashboard inicializado com sucesso');
    } catch (error) {
        Logger.error('Erro ao inicializar dashboard:', error);
        Toast.error('Erro ao carregar o dashboard');
    }
});
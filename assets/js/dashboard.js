// Verifica autenticação
Auth.verificarAuth();

// Carrega o nome do usuário
document.getElementById('userName').textContent = Auth.getUserName();

// Função para carregar dados do dashboard
async function carregarDados() {
    try {
        Logger.info('Carregando dados do dashboard...');
        
        const response = await axios.get('/api/dashboard/stats');
        const data = response.data;
        
        // Atualiza os totais
        document.getElementById('totalClientes').textContent = data.totalClientes || 0;
        document.getElementById('totalContratos').textContent = data.totalContratos || 0;
        document.getElementById('totalOrdens').textContent = data.totalOrdens || 0;
        document.getElementById('totalFaturas').textContent = data.totalFaturas || 0;
        
        Logger.info('Dados do dashboard carregados com sucesso');
        Toast.success('Dashboard atualizado');
    } catch (error) {
        Logger.error('Erro ao carregar dados do dashboard:', error);
        Toast.error('Erro ao carregar dados do dashboard');
    }
}

// Função para carregar eventos do calendário
async function carregarEventos() {
    try {
        Logger.info('Carregando eventos do calendário...');
        
        const response = await axios.get('/api/dashboard/events');
        const events = response.data;
        
        // Atualiza os eventos do calendário
        if (window.calendar) {
            window.calendar.events = events;
            window.calendar.render();
            Logger.info('Eventos do calendário carregados com sucesso');
        } else {
            throw new Error('Calendário não inicializado');
        }
    } catch (error) {
        Logger.error('Erro ao carregar eventos do calendário:', error);
        Toast.error('Erro ao carregar eventos do calendário');
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    try {
        Logger.info('Inicializando dashboard...');
        
        // Carrega dados iniciais
        await carregarDados();
        
        // Inicializa o calendário
        window.calendar = new Calendar();
        
        // Carrega eventos do calendário
        await carregarEventos();
        
        Logger.info('Dashboard inicializado com sucesso');
    } catch (error) {
        Logger.error('Erro ao inicializar dashboard:', error);
        Toast.error('Erro ao inicializar dashboard');
    }
});
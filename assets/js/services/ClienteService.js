class ClienteService {
    constructor() {
        this.baseUrl = '../api/clientes';
        Logger.info('ClienteService inicializado', { baseUrl: this.baseUrl });
    }

    async verificarAutenticacao() {
        if (!Auth.token) {
            Logger.error('Token não encontrado');
            throw new Error('Você precisa estar autenticado para acessar este recurso');
        }
    }

    async listar() {
        try {
            Logger.debug('Iniciando listagem de clientes');
            await this.verificarAutenticacao();
            
            const response = await axios.get(`${this.baseUrl}/listar.php`);
            if (!response.data || !response.data.success) {
                throw new Error(response.data?.message || 'Erro ao listar clientes');
            }
            
            Logger.debug('Clientes listados com sucesso', { count: response.data.data?.length });
            return Array.isArray(response.data.data) ? response.data.data : [];
        } catch (error) {
            Logger.error('Erro ao listar clientes', error);
            throw error;
        }
    }

    async buscar(id) {
        try {
            Logger.debug('Buscando cliente', { id });
            await this.verificarAutenticacao();
            
            const response = await axios.get(`${this.baseUrl}/buscar.php?id=${id}`);
            Logger.debug('Cliente encontrado', response.data);
            return response.data.data;
        } catch (error) {
            Logger.error('Erro ao buscar cliente', error);
            throw error;
        }
    }

    async salvar(dados) {
        try {
            Logger.debug('Salvando cliente', dados);
            await this.verificarAutenticacao();
            
            const response = await axios.post(`${this.baseUrl}/salvar.php`, dados);
            Logger.debug('Cliente salvo com sucesso', response.data);
            return response.data;
        } catch (error) {
            Logger.error('Erro ao salvar cliente', error);
            throw error;
        }
    }

    async excluir(id) {
        try {
            Logger.debug('Iniciando exclusão de cliente', { id });
            await this.verificarAutenticacao();
            
            const response = await axios.post(`${this.baseUrl}/excluir.php`, { id });
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Erro ao excluir cliente');
            }
            
            Logger.debug('Cliente excluído com sucesso', response.data);
            return response.data;
        } catch (error) {
            Logger.error('Erro na exclusão do cliente', error);
            throw new Error(
                error.response?.data?.message || 
                error.message || 
                'Erro ao excluir cliente'
            );
        }
    }

    async buscarCep(cep) {
        try {
            Logger.debug('Consultando CEP', { cep });
            const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
            Logger.debug('CEP consultado com sucesso', response.data);
            return response.data;
        } catch (error) {
            Logger.error('Erro ao consultar CEP', error);
            throw error;
        }
    }
}
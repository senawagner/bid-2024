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
            
            Logger.debug('Fazendo requisição para a API');
            const response = await axios.get(`${this.baseUrl}/listar.php`);
            Logger.debug('Resposta da API', { 
                status: response.status,
                statusText: response.statusText,
                data: response.data
            });
            
            if (!response.data || !response.data.success) {
                Logger.error('Resposta da API indica erro', response.data);
                throw new Error(response.data?.message || 'Erro ao listar clientes');
            }
            
            if (!Array.isArray(response.data.data)) {
                Logger.error('Dados retornados não são um array', response.data);
                throw new Error('Formato de dados inválido');
            }
            
            Logger.debug('Clientes listados com sucesso', { count: response.data.data.length });
            return response.data.data;
        } catch (error) {
            if (error.response) {
                Logger.error('Erro na resposta da API', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data
                });
            } else if (error.request) {
                Logger.error('Sem resposta da API', { request: error.request });
            } else {
                Logger.error('Erro ao fazer requisição', { message: error.message });
            }
            throw new Error('Erro ao listar clientes');
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
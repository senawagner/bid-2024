class ClienteService {
    constructor() {
        this.baseUrl = '../api/clientes';
    }

    async listar() {
        try {
            const response = await axios.get(`${this.baseUrl}/listar.php`);
            if (!response.data || !response.data.success) {
                throw new Error(response.data?.message || 'Erro ao listar clientes');
            }
            return Array.isArray(response.data.data) ? response.data.data : [];
        } catch (error) {
            Logger.error('Erro ao listar clientes', error);
            throw error;
        }
    }

    async buscar(id) {
        try {
            const response = await axios.get(`${this.baseUrl}/buscar.php?id=${id}`);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }

    async salvar(dados) {
        try {
            const response = await axios.post(`${this.baseUrl}/salvar.php`, dados);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async excluir(id) {
        try {
            Logger.debug('Enviando requisição de exclusão', { id });
            const response = await axios.post(`${this.baseUrl}/excluir.php`, { id });
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Erro ao excluir cliente');
            }
            
            return response.data;
        } catch (error) {
            Logger.error('Erro na requisição de exclusão', error);
            throw new Error(
                error.response?.data?.message || 
                error.message || 
                'Erro ao excluir cliente'
            );
        }
    }

    async buscarCep(cep) {
        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
} 
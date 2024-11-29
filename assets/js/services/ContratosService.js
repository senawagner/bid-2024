class ContratosService {
    constructor() {
        this.baseUrl = '../api/v1/contratos';
        Logger.info('ContratosService inicializado', { baseUrl: this.baseUrl });
    }

    async verificarAutenticacao() {
        if (!Auth.token) {
            Logger.error('Token não encontrado');
            throw new Error('Você precisa estar autenticado para acessar este recurso');
        }
    }

    async listar(filtros = {}) {
        try {
            Logger.debug('Iniciando listagem de contratos', filtros);
            await this.verificarAutenticacao();
            
            const params = new URLSearchParams();
            if (filtros.cliente_id) params.append('cliente_id', filtros.cliente_id);
            if (filtros.tipo_contrato) params.append('tipo_contrato', filtros.tipo_contrato);
            if (filtros.status) params.append('status', filtros.status);
            
            const url = `${this.baseUrl}${params.toString() ? '?' + params.toString() : ''}`;
            const response = await axios.get(url);
            
            Logger.debug('Contratos listados com sucesso', { count: response.data?.data?.length });
            return response.data;
        } catch (error) {
            Logger.error('Erro ao listar contratos', error);
            throw error;
        }
    }

    async buscar(id) {
        try {
            Logger.debug('Buscando contrato', { id });
            await this.verificarAutenticacao();
            
            const response = await axios.get(`${this.baseUrl}/${id}`);
            Logger.debug('Contrato encontrado', response.data);
            return response.data.data;
        } catch (error) {
            Logger.error('Erro ao buscar contrato', error);
            throw error;
        }
    }

    async salvar(dados) {
        try {
            Logger.debug('Salvando contrato', dados);
            await this.verificarAutenticacao();
            
            const method = dados.id ? 'put' : 'post';
            const url = dados.id ? `${this.baseUrl}/${dados.id}` : this.baseUrl;
            
            const response = await axios[method](url, dados);
            Logger.debug('Contrato salvo com sucesso', response.data);
            return response.data;
        } catch (error) {
            Logger.error('Erro ao salvar contrato', error);
            throw error;
        }
    }

    async excluir(id) {
        try {
            Logger.debug('Excluindo contrato', { id });
            await this.verificarAutenticacao();
            
            const response = await axios.delete(`${this.baseUrl}/${id}`);
            Logger.debug('Contrato excluído com sucesso');
            return response.data;
        } catch (error) {
            Logger.error('Erro ao excluir contrato', error);
            throw error;
        }
    }
}

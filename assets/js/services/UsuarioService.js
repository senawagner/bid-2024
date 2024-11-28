class UsuarioService {
    constructor() {
        this.api = '/api/usuarios/';
        this.logger = new Logger('UsuarioService');
    }

    async listar() {
        try {
            this.logger.debug('Listando usuários');
            const response = await fetch(`${this.api}listar.php`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message);
            }
            
            this.logger.info('Usuários listados com sucesso');
            return data.data;
        } catch (error) {
            this.logger.error('Erro ao listar usuários', error);
            throw error;
        }
    }

    async buscar(id) {
        try {
            this.logger.debug('Buscando usuário', { id });
            const response = await fetch(`${this.api}buscar.php?id=${id}`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message);
            }
            
            this.logger.info('Usuário encontrado', { id });
            return data.data;
        } catch (error) {
            this.logger.error('Erro ao buscar usuário', error);
            throw error;
        }
    }

    async salvar(dados) {
        try {
            this.logger.debug('Salvando usuário', dados);
            const response = await fetch(`${this.api}salvar.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message);
            }
            
            this.logger.info('Usuário salvo com sucesso', { id: data.data?.id });
            return data.data;
        } catch (error) {
            this.logger.error('Erro ao salvar usuário', error);
            throw error;
        }
    }

    async excluir(id) {
        try {
            this.logger.debug('Excluindo usuário', { id });
            const response = await fetch(`${this.api}excluir.php`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message);
            }
            
            this.logger.info('Usuário excluído com sucesso', { id });
            return true;
        } catch (error) {
            this.logger.error('Erro ao excluir usuário', error);
            throw error;
        }
    }
} 
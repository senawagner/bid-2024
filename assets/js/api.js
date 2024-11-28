const Api = {
    baseUrl: '/api/v1',

    // Simulação de dados (temporário)
    usuarios: [],

    Usuarios: {
        async listar() {
            // Simulando uma chamada API
            return {
                sucesso: true,
                dados: Api.usuarios
            };
        },

        async criar(usuario) {
            // Simulando uma chamada API
            try {
                usuario.id = Date.now(); // Gerando ID único
                Api.usuarios.push(usuario);
                return {
                    sucesso: true,
                    mensagem: 'Usuário criado com sucesso',
                    dados: usuario
                };
            } catch (error) {
                return {
                    sucesso: false,
                    mensagem: 'Erro ao criar usuário'
                };
            }
        },

        async atualizar(id, usuario) {
            // Simulando uma chamada API
            try {
                const index = Api.usuarios.findIndex(u => u.id === parseInt(id));
                if (index !== -1) {
                    Api.usuarios[index] = { ...Api.usuarios[index], ...usuario };
                    return {
                        sucesso: true,
                        mensagem: 'Usuário atualizado com sucesso',
                        dados: Api.usuarios[index]
                    };
                }
                throw new Error('Usuário não encontrado');
            } catch (error) {
                return {
                    sucesso: false,
                    mensagem: 'Erro ao atualizar usuário'
                };
            }
        },

        async excluir(id) {
            // Simulando uma chamada API
            try {
                Api.usuarios = Api.usuarios.filter(u => u.id !== id);
                return {
                    sucesso: true,
                    mensagem: 'Usuário excluído com sucesso'
                };
            } catch (error) {
                return {
                    sucesso: false,
                    mensagem: 'Erro ao excluir usuário'
                };
            }
        }
    }
};

window.Api = Api; 
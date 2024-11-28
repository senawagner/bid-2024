import { logger } from './utils/Logger.js';

const UsuariosController = {
    // Estado
    usuarios: [],

    // Carregar usuários
    async loadUsuarios() {
        try {
            const response = await Api.Usuarios.listar();
            if (response.sucesso) {
                this.usuarios = response.dados;
                this.renderTable();
            } else {
                Toast.error('Erro ao carregar usuários');
            }
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            Toast.error('Erro ao carregar usuários');
        }
    },

    // Renderizar tabela
    renderTable() {
        const tbody = document.getElementById('usuariosTable');
        tbody.innerHTML = '';

        this.usuarios.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.nome}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td><span class="badge badge-${user.nivel === 'admin' ? 'danger' : 'info'}">${user.nivel}</span></td>
                <td><span class="badge badge-${user.ativo ? 'success' : 'secondary'}">${user.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="UsuariosController.edit(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="UsuariosController.delete(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    // Limpar formulário
    clearForm() {
        const form = document.getElementById('formUsuario');
        form.reset();
        document.getElementById('userId').value = '';
        document.getElementById('modalUsuarioLabel').textContent = 'Novo Usuário';
    },

    // Novo usuário
    new() {
        this.clearForm();
        $('#modalUsuario').modal('show');
    },

    // Editar usuário
    edit(id) {
        const user = this.usuarios.find(u => u.id === id);
        if (user) {
            document.getElementById('userId').value = user.id;
            document.getElementById('nome').value = user.nome;
            document.getElementById('username').value = user.username;
            document.getElementById('email').value = user.email;
            document.getElementById('nivel').value = user.nivel;
            document.getElementById('ativo').checked = user.ativo;
            document.getElementById('modalUsuarioLabel').textContent = 'Editar Usuário';
            $('#modalUsuario').modal('show');
        }
    },

    // Deletar usuário
    async delete(id) {
        try {
            if (confirm('Tem certeza que deseja excluir este usuário?')) {
                const response = await Api.Usuarios.excluir(id);
                if (response.sucesso) {
                    await this.loadUsuarios();
                    Toast.success('Usuário excluído com sucesso!');
                } else {
                    Toast.error(response.mensagem || 'Erro ao excluir usuário');
                }
            }
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            Toast.error('Erro ao excluir usuário');
        }
    },

    // Handle form submit
    handleSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        // Estrutura correta do objeto usuário
        const usuario = {
            id: formData.get('userId') || null, // Importante para diferenciar create/update
            nome: formData.get('nome'),
            username: formData.get('username'),
            email: formData.get('email'),
            nivel: formData.get('nivel'),
            ativo: formData.get('ativo') === 'on',
            senha: formData.get('senha') // Será undefined se não preenchido
        };

        // Remove senha se estiver vazia (caso de edição)
        if (!usuario.senha) {
            delete usuario.senha;
        }

        // Decide entre criar ou atualizar
        if (usuario.id) {
            this.atualizarUsuario(usuario.id, usuario);
        } else {
            this.criarUsuario(usuario);
        }
    },

    // Criar novo usuário
    async criarUsuario(usuario) {
        try {
            if (!usuario.senha) {
                Toast.error('Senha é obrigatória para novo usuário');
                return;
            }

            const response = await Api.Usuarios.criar(usuario);
            if (response.sucesso) {
                await this.loadUsuarios();
                $('#modalUsuario').modal('hide');
                Toast.success('Usuário cadastrado com sucesso!');
            } else {
                Toast.error(response.mensagem || 'Erro ao cadastrar usuário');
            }
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            Toast.error('Erro ao cadastrar usuário');
        }
    },

    // Atualizar usuário existente
    async atualizarUsuario(id, usuario) {
        try {
            const response = await Api.Usuarios.atualizar(id, usuario);
            if (response.sucesso) {
                await this.loadUsuarios();
                $('#modalUsuario').modal('hide');
                Toast.success('Usuário atualizado com sucesso!');
            } else {
                Toast.error(response.mensagem || 'Erro ao atualizar usuário');
            }
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            Toast.error('Erro ao atualizar usuário');
        }
    },

    // Inicialização
    init() {
        logger.debug('Inicializando UsuariosController', null, 'usuarios');
        
        // Verificar autenticação
        if (!Auth.checkAuth()) return;

        // Bind do evento submit do formulário
        const form = document.getElementById('formUsuario');
        console.log('Form encontrado:', form); // Debug
        
        if (form) {
            form.addEventListener('submit', (e) => {
                console.log('Submit event triggered'); // Debug
                this.handleSubmit.call(this, e);
            });
        }
        
        // Carregar dados iniciais
        this.loadUsuarios();
    },

    async salvarUsuario(dados) {
        try {
            logger.info('Iniciando salvamento de usuário', dados, 'usuarios');
            // ... lógica de salvamento
        } catch (error) {
            logger.error('Erro ao salvar usuário', error, 'usuarios');
            throw error;
        }
    }
};

// Exportar para uso global
window.UsuariosController = UsuariosController;

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    UsuariosController.init();
}); 
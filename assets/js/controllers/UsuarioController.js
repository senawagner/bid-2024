class UsuarioController {
    constructor() {
        if (!Logger) {
            console.error('Logger não encontrado');
            return;
        }
        
        this.logger = Logger;
        this.logger.info('Inicializando UsuarioController');
        
        this.form = document.getElementById('formUsuario');
        this.modal = new bootstrap.Modal(document.getElementById('modalUsuario'));
        this.table = document.querySelector('table tbody');
        
        this.initializeListeners();
        this.loadUsuarios();
    }

    initializeListeners() {
        this.logger.debug('Inicializando listeners');
        
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            this.logger.debug('Listener de submit adicionado ao form');
        }

        const btnNovo = document.querySelector('.btn-novo');
        if (btnNovo) {
            btnNovo.addEventListener('click', () => this.handleNovo());
            this.logger.debug('Listener adicionado ao botão novo');
        }
    }

    async loadUsuarios() {
        try {
            this.logger.info('Carregando lista de usuários');
            const response = await axios.get('../api/usuarios/listar.php');
            
            if (response.data.success) {
                this.logger.info(`${response.data.data.length} usuários carregados`);
                this.renderUsuarios(response.data.data);
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            this.logger.error('Erro ao carregar usuários:', error);
            Toast.error('Erro ao carregar usuários: ' + (error.response?.data?.message || error.message));
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        try {
            this.logger.info('Iniciando submissão do formulário');
            const formData = new FormData(this.form);
            const dados = Object.fromEntries(formData);
            
            this.logger.debug('Dados do formulário:', dados);
            
            const response = await axios.post('../api/usuarios/salvar.php', dados);
            
            if (response.data.success) {
                this.logger.info('Usuário salvo com sucesso');
                Toast.success('Usuário salvo com sucesso!');
                this.modal.hide();
                await this.loadUsuarios();
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            this.logger.error('Erro ao salvar usuário:', error);
            Toast.error('Erro ao salvar usuário: ' + (error.response?.data?.message || error.message));
        }
    }

    handleNovo() {
        this.logger.debug('Iniciando cadastro de novo usuário');
        this.form.reset();
        this.form.querySelector('[name="id"]')?.remove();
        document.querySelector('#modalUsuario .modal-title').textContent = 'Novo Usuário';
        this.modal.show();
    }

    async editar(id) {
        try {
            this.logger.info(`Carregando usuário ${id} para edição`);
            const response = await axios.get(`../api/usuarios/buscar.php?id=${id}`);
            
            if (response.data.success) {
                const usuario = response.data.data;
                
                // Adiciona campo hidden para o ID
                if (!this.form.querySelector('[name="id"]')) {
                    const idInput = document.createElement('input');
                    idInput.type = 'hidden';
                    idInput.name = 'id';
                    this.form.appendChild(idInput);
                }
                
                // Preenche o formulário
                Object.keys(usuario).forEach(key => {
                    const input = this.form.querySelector(`[name="${key}"]`);
                    if (input) input.value = usuario[key];
                });
                
                document.querySelector('#modalUsuario .modal-title').textContent = 'Editar Usuário';
                this.modal.show();
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            this.logger.error('Erro ao carregar usuário:', error);
            Toast.error('Erro ao carregar usuário: ' + (error.response?.data?.message || error.message));
        }
    }

    async excluir(id) {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
        
        try {
            this.logger.info(`Excluindo usuário ${id}`);
            const response = await axios.post('../api/usuarios/excluir.php', { id });
            
            if (response.data.success) {
                this.logger.info('Usuário excluído com sucesso');
                Toast.success('Usuário excluído com sucesso!');
                await this.loadUsuarios();
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            this.logger.error('Erro ao excluir usuário:', error);
            Toast.error('Erro ao excluir usuário: ' + (error.response?.data?.message || error.message));
        }
    }

    async visualizar(id) {
        try {
            this.logger.info(`Carregando detalhes do usuário ${id}`);
            const response = await axios.get(`../api/usuarios/buscar.php?id=${id}`);
            
            if (response.data.success) {
                const usuario = response.data.data;
                const detalhes = `
                    <div class="row">
                        <div class="col-md-12">
                            <p><strong>Nome:</strong> ${usuario.nome}</p>
                            <p><strong>Username:</strong> ${usuario.username}</p>
                            <p><strong>Email:</strong> ${usuario.email}</p>
                            <p><strong>Nível:</strong> ${usuario.nivel}</p>
                            <p><strong>Status:</strong> ${usuario.ativo ? 'Ativo' : 'Inativo'}</p>
                            <p><strong>Criado em:</strong> ${new Date(usuario.created_at).toLocaleString()}</p>
                            <p><strong>Última atualização:</strong> ${new Date(usuario.updated_at).toLocaleString()}</p>
                        </div>
                    </div>
                `;
                
                // Cria modal de visualização
                const modalHtml = `
                    <div class="modal fade" id="modalVisualizarUsuario">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h4 class="modal-title">Detalhes do Usuário</h4>
                                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                                </div>
                                <div class="modal-body">
                                    ${detalhes}
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Remove modal anterior se existir
                const modalAntigo = document.getElementById('modalVisualizarUsuario');
                if (modalAntigo) modalAntigo.remove();
                
                // Adiciona novo modal ao DOM
                document.body.insertAdjacentHTML('beforeend', modalHtml);
                
                // Mostra o modal
                const modal = new bootstrap.Modal(document.getElementById('modalVisualizarUsuario'));
                modal.show();
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            this.logger.error('Erro ao carregar detalhes do usuário:', error);
            Toast.error('Erro ao carregar detalhes do usuário: ' + (error.response?.data?.message || error.message));
        }
    }

    renderUsuarios(usuarios) {
        this.logger.debug('Renderizando lista de usuários');
        if (!this.table) return;

        this.table.innerHTML = usuarios.map(usuario => `
            <tr>
                <td>${usuario.id}</td>
                <td>${usuario.nome}</td>
                <td>${usuario.username}</td>
                <td>${usuario.email}</td>
                <td>${usuario.nivel}</td>
                <td>${usuario.ativo ? '<span class="badge badge-success">Ativo</span>' : '<span class="badge badge-danger">Inativo</span>'}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="usuarioController.visualizar(${usuario.id})" title="Visualizar">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="usuarioController.editar(${usuario.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="usuarioController.excluir(${usuario.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    window.usuarioController = new UsuarioController();
});
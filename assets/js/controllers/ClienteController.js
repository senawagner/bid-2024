class ClienteController {
    constructor() {
        Logger.info('Inicializando ClienteController');
        try {
            this.service = new ClienteService();
            this.dataTable = null;
            this.initEventListeners();
            this.initDataTable();
            this.initMasks();
            this.initCepSearch();
        } catch (error) {
            Logger.error('Erro ao inicializar ClienteController', error);
            throw error;
        }
    }

    initDataTable() {
        try {
            Logger.debug('Inicializando DataTable');
            
            if (this.dataTable) {
                this.dataTable.destroy();
                this.dataTable = null;
            }

            this.dataTable = $('#tabelaClientes').DataTable({
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json'
                },
                data: [],
                columns: [
                    { data: 'id' },
                    { data: 'razao_social' },
                    { data: 'nome_fantasia' },
                    { data: 'cnpj' },
                    { data: 'email' },
                    { data: 'telefone' },
                    { 
                        data: null,
                        render: function(data) {
                            return `${data.cidade || ''}/${data.estado || ''}`;
                        }
                    },
                    {
                        data: null,
                        render: function(data) {
                            return `
                                <div class="btn-group">
                                    <button type="button" class="btn btn-sm btn-info" onclick="clienteController.editar(${data.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button type="button" class="btn btn-sm btn-danger" onclick="clienteController.excluir(${data.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            `;
                        }
                    }
                ],
                processing: true,
                responsive: true,
                dom: '<"d-flex justify-content-between"Bf>rtip',
                buttons: [
                    {
                        extend: 'collection',
                        text: 'Exportar',
                        buttons: [
                            'copy',
                            'csv',
                            'excel',
                            'pdf',
                            'print'
                        ]
                    }
                ]
            });

            this.carregarClientes();
            Logger.debug('DataTable inicializado com sucesso');
        } catch (error) {
            Logger.error('Erro ao inicializar DataTable', error);
            throw error;
        }
    }

    initMasks() {
        $('#cnpj').mask('00.000.000/0000-00');
        $('#telefone').mask('(00) 0000-0000');
        $('#celular').mask('(00) 00000-0000');
        $('#cep').mask('00000-000');
    }

    initCepSearch() {
        $('#cep').blur(async (e) => {
            const cep = e.target.value.replace(/\D/g, '');
            if (cep.length === 8) {
                try {
                    const endereco = await this.service.buscarCep(cep);
                    if (!endereco.erro) {
                        $('#endereco').val(endereco.logradouro);
                        $('#bairro').val(endereco.bairro);
                        $('#cidade').val(endereco.localidade);
                        $('#estado').val(endereco.uf);
                    }
                } catch (error) {
                    console.error('Erro ao buscar CEP:', error);
                }
            }
        });
    }

    async carregarClientes() {
        try {
            Logger.debug('Carregando clientes');
            const clientes = await this.service.listar();
            
            if (!Array.isArray(clientes)) {
                Logger.error('Dados de clientes inválidos', clientes);
                throw new Error('Formato de dados inválido');
            }
            
            if (this.dataTable) {
                this.dataTable.clear();
                if (clientes.length > 0) {
                    this.dataTable.rows.add(clientes).draw();
                } else {
                    this.dataTable.draw();
                }
            }
            
            Logger.debug('Clientes carregados com sucesso', clientes);
        } catch (error) {
            Logger.error('Erro ao carregar clientes', error);
            Toast.error('Erro ao carregar clientes');
        }
    }

    abrirModalCadastro() {
        try {
            Logger.info('Abrindo modal de cadastro');
            const modalElement = document.getElementById('modalCliente');
            if (!modalElement) {
                throw new Error('Modal não encontrado');
            }

            const form = document.getElementById('formCliente');
            if (form) {
                form.reset();
            }
            document.getElementById('id').value = '';

            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        } catch (error) {
            Logger.error('Erro ao abrir modal', error);
            Toast.error('Erro ao abrir formulário');
        }
    }

    async editar(id) {
        try {
            const cliente = await this.service.buscar(id);
            if (cliente) {
                Object.keys(cliente).forEach(key => {
                    const input = document.getElementById(key);
                    if (input) {
                        input.value = cliente[key];
                    }
                });

                const modal = new bootstrap.Modal(document.getElementById('modalCliente'));
                modal.show();
            }
        } catch (error) {
            Logger.error('Erro ao editar cliente', error);
            Toast.error('Erro ao carregar dados do cliente');
        }
    }

    async excluir(id) {
        try {
            if (!confirm('Deseja realmente excluir este cliente?')) {
                return;
            }

            Logger.debug('Excluindo cliente', { id });
            
            const response = await this.service.excluir(id);
            
            if (response.success) {
                Toast.success('Cliente excluído com sucesso');
                await this.carregarClientes();
            } else {
                throw new Error(response.message || 'Erro ao excluir cliente');
            }
        } catch (error) {
            Logger.error('Erro ao excluir cliente', error);
            Toast.error(error.message || 'Erro ao excluir cliente');
        }
    }

    validarCNPJ(cnpj) {
        cnpj = cnpj.replace(/[^\d]+/g, '');
        if (cnpj.length !== 14) return false;
        return true;
    }

    validarEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    initEventListeners() {
        const btnNovo = document.getElementById('btnNovoCliente');
        if (btnNovo) {
            btnNovo.addEventListener('click', () => {
                this.abrirModalCadastro();
            });
        }

        const btnSalvar = document.getElementById('btnSalvarCliente');
        if (btnSalvar) {
            btnSalvar.addEventListener('click', () => {
                this.salvar();
            });
        }

        const btnSair = document.getElementById('btnSair');
        if (btnSair) {
            btnSair.addEventListener('click', () => {
                Auth.logout();
            });
        }
    }

    async salvar() {
        try {
            const form = document.getElementById('formCliente');
            if (!form) {
                throw new Error('Formulário não encontrado');
            }

            const dados = {
                id: document.getElementById('id').value,
                razao_social: document.getElementById('razao_social').value,
                nome_fantasia: document.getElementById('nome_fantasia').value,
                cnpj: document.getElementById('cnpj').value,
                inscricao_estadual: document.getElementById('inscricao_estadual').value,
                email: document.getElementById('email').value,
                telefone: document.getElementById('telefone').value,
                celular: document.getElementById('celular').value,
                cep: document.getElementById('cep').value,
                endereco: document.getElementById('endereco').value,
                numero: document.getElementById('numero').value,
                complemento: document.getElementById('complemento').value,
                bairro: document.getElementById('bairro').value,
                cidade: document.getElementById('cidade').value,
                estado: document.getElementById('estado').value,
                observacoes: document.getElementById('observacoes').value
            };

            const response = await this.service.salvar(dados);
            
            if (response.success) {
                Toast.success('Cliente salvo com sucesso');
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalCliente'));
                if (modal) {
                    modal.hide();
                }
                await this.carregarClientes();
            } else {
                Toast.error(response.message || 'Erro ao salvar cliente');
            }
        } catch (error) {
            Logger.error('Erro ao salvar cliente', error);
            Toast.error('Erro ao salvar cliente');
        }
    }
} 
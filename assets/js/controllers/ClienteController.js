class ClienteController {
    constructor() {
        Logger.info('Inicializando ClienteController');
        try {
            this.form = document.getElementById('formCliente');
            this.modal = new bootstrap.Modal(document.getElementById('modalCliente'));
            this.dataTable = null;
            
            // Inicializa os listeners
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

            const table = $('#tabelaClientes').DataTable({
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
                                    <button type="button" class="btn btn-sm btn-info" onclick="window.clienteController.visualizar(${data.id})" title="Visualizar">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button type="button" class="btn btn-sm btn-warning" onclick="window.clienteController.editar(${data.id})" title="Editar">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button type="button" class="btn btn-sm btn-danger" onclick="window.clienteController.excluir(${data.id})" title="Excluir">
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

            this.dataTable = table;
            this.carregarClientes();
            Logger.debug('DataTable inicializado com sucesso');
        } catch (error) {
            Logger.error('Erro ao inicializar DataTable', error);
            throw error;
        }
    }

    initMasks() {
        try {
            Logger.debug('Inicializando máscaras');
            $('#cnpj').mask('00.000.000/0000-00');
            $('#telefone').mask('(00) 0000-0000');
            $('#celular').mask('(00) 00000-0000');
            $('#cep').mask('00000-000');
            Logger.debug('Máscaras inicializadas com sucesso');
        } catch (error) {
            Logger.error('Erro ao inicializar máscaras', error);
            Toast.error('Erro ao inicializar máscaras dos campos');
        }
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
            Logger.info('Carregando lista de clientes');
            const response = await axios.get('../api/clientes/listar.php');
            
            if (response.data.success) {
                Logger.info(`${response.data.data.length} clientes carregados`);
                if (this.dataTable) {
                    this.dataTable.clear();
                    this.dataTable.rows.add(response.data.data);
                    this.dataTable.draw();
                }
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Erro ao carregar clientes');
            }
        } catch (error) {
            Logger.error('Erro ao carregar clientes', error);
            Toast.error('Erro ao carregar clientes: ' + (error.response?.data?.message || error.message));
            throw error;
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

    novo() {
        try {
            Logger.info('Abrindo modal para novo cliente');
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
            Logger.debug('Modal de novo cliente aberto com sucesso');
        } catch (error) {
            Logger.error('Erro ao abrir modal de novo cliente', error);
            Toast.error('Erro ao abrir formulário');
        }
    }

    async editar(id) {
        try {
            Logger.info(`Carregando cliente ${id} para edição`);
            const response = await axios.get(`../api/clientes/buscar.php?id=${id}`);
            
            if (response.data.success) {
                const cliente = response.data.data;
                
                // Mapeamento de campos do banco para IDs do formulário
                const camposMap = {
                    'id': 'id',
                    'tipo_cliente': 'tipoCliente',
                    'razao_social': 'razaoSocial',
                    'nome_fantasia': 'nomeFantasia',
                    'cnpj': 'cnpj',
                    'inscricao_estadual': 'inscricaoEstadual',
                    'email': 'email',
                    'site': 'site',
                    'telefone': 'telefone',
                    'celular': 'celular',
                    'endereco': 'endereco',
                    'numero': 'numero',
                    'complemento': 'complemento',
                    'bairro': 'bairro',
                    'cidade': 'cidade',
                    'estado': 'estado',
                    'cep': 'cep',
                    'observacoes': 'observacoes'
                };

                // Preenche o formulário com os dados do cliente
                Object.entries(camposMap).forEach(([dbField, formId]) => {
                    const elemento = document.getElementById(formId);
                    if (elemento) {
                        elemento.value = cliente[dbField] || '';
                    } else {
                        Logger.warn(`Campo não encontrado no formulário: ${formId}`);
                    }
                });
                
                // Atualiza o título do modal
                const tituloModal = document.querySelector('#modalCliente .modal-title');
                if (tituloModal) {
                    tituloModal.textContent = 'Editar Cliente';
                }
                
                // Mostra o modal
                if (this.modal) {
                    this.modal.show();
                    Logger.debug('Modal de edição aberto com sucesso', { cliente });
                } else {
                    throw new Error('Modal não inicializado');
                }
            } else {
                throw new Error(response.data.message || 'Erro ao carregar dados do cliente');
            }
        } catch (error) {
            Logger.error('Erro ao editar cliente', error);
            Toast.error('Erro ao carregar dados do cliente: ' + (error.response?.data?.message || error.message));
        }
    }

    async excluir(id) {
        if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
        
        try {
            Logger.info(`Excluindo cliente ${id}`);
            const response = await axios.post('../api/clientes/excluir.php', { id });
            
            if (response.data.success) {
                Toast.success(response.data.message || 'Cliente excluído com sucesso');
                await this.carregarClientes();
            } else {
                throw new Error(response.data.message || 'Erro ao excluir cliente');
            }
        } catch (error) {
            Logger.error('Erro ao excluir cliente', error);
            Toast.error('Erro ao excluir cliente: ' + (error.response?.data?.message || error.message));
        }
    }

    async visualizar(id) {
        try {
            Logger.info(`Carregando detalhes do cliente ${id}`);
            const response = await axios.get(`../api/clientes/buscar.php?id=${id}`);
            
            if (response.data.success) {
                const cliente = response.data.data;
                
                // Cria o HTML dos detalhes
                const detalhes = `
                    <div class="row">
                        <div class="col-md-12">
                            <p><strong>Tipo:</strong> ${cliente.tipo_cliente === 'juridica' ? 'Pessoa Jurídica' : 'Pessoa Física'}</p>
                            <p><strong>Razão Social:</strong> ${cliente.razao_social}</p>
                            <p><strong>Nome Fantasia:</strong> ${cliente.nome_fantasia || '-'}</p>
                            <p><strong>CNPJ:</strong> ${cliente.cnpj || '-'}</p>
                            <p><strong>Inscrição Estadual:</strong> ${cliente.inscricao_estadual || '-'}</p>
                            <p><strong>Email:</strong> ${cliente.email || '-'}</p>
                            <p><strong>Site:</strong> ${cliente.site || '-'}</p>
                            <p><strong>Telefone:</strong> ${cliente.telefone || '-'}</p>
                            <p><strong>Celular:</strong> ${cliente.celular || '-'}</p>
                            <p><strong>Endereço:</strong> ${cliente.endereco}, ${cliente.numero}</p>
                            <p><strong>Complemento:</strong> ${cliente.complemento || '-'}</p>
                            <p><strong>Bairro:</strong> ${cliente.bairro}</p>
                            <p><strong>Cidade:</strong> ${cliente.cidade}</p>
                            <p><strong>Estado:</strong> ${cliente.estado}</p>
                            <p><strong>CEP:</strong> ${cliente.cep}</p>
                            <p><strong>Observações:</strong> ${cliente.observacoes || '-'}</p>
                        </div>
                    </div>
                `;
                
                // Remove modal anterior se existir
                const modalAntigo = document.getElementById('modalVisualizarCliente');
                if (modalAntigo) modalAntigo.remove();
                
                // Cria o novo modal
                const modalHtml = `
                    <div class="modal fade" id="modalVisualizarCliente" tabindex="-1">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">Detalhes do Cliente</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                </div>
                                <div class="modal-body">
                                    ${detalhes}
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Adiciona o modal ao DOM
                document.body.insertAdjacentHTML('beforeend', modalHtml);
                
                // Mostra o modal
                const modalVisualizar = new bootstrap.Modal(document.getElementById('modalVisualizarCliente'));
                modalVisualizar.show();
            } else {
                throw new Error(response.data.message || 'Erro ao carregar detalhes do cliente');
            }
        } catch (error) {
            Logger.error('Erro ao visualizar cliente', error);
            Toast.error('Erro ao carregar detalhes do cliente: ' + (error.response?.data?.message || error.message));
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
        try {
            Logger.info('Inicializando event listeners');
            
            // Listener para o botão salvar
            const btnSalvar = document.getElementById('btnSalvarCliente');
            if (btnSalvar) {
                btnSalvar.addEventListener('click', (e) => this.salvar(e));
                Logger.debug('Listener adicionado ao botão salvar');
            }

            // Botão novo cliente
            const btnNovo = document.querySelector('#btnNovoCliente');
            if (btnNovo) {
                btnNovo.addEventListener('click', () => this.novo());
                Logger.debug('Listener adicionado ao botão novo');
            } else {
                Logger.warn('Botão novo cliente não encontrado');
            }

        } catch (error) {
            Logger.error('Erro ao inicializar event listeners', error);
            throw error;
        }
    }

    async salvar(event) {
        if (event) event.preventDefault();
        
        try {
            Logger.info('Iniciando salvamento do cliente');
            
            // Coleta os dados do formulário usando IDs específicos
            const dados = {
                id: document.getElementById('id')?.value || '',
                tipo_cliente: document.getElementById('tipoCliente')?.value || '',
                razao_social: document.getElementById('razaoSocial')?.value || '',
                nome_fantasia: document.getElementById('nomeFantasia')?.value || '',
                cnpj: document.getElementById('cnpj')?.value || '',
                inscricao_estadual: document.getElementById('inscricaoEstadual')?.value || '',
                email: document.getElementById('email')?.value || '',
                site: document.getElementById('site')?.value || '',
                telefone: document.getElementById('telefone')?.value || '',
                celular: document.getElementById('celular')?.value || '',
                endereco: document.getElementById('endereco')?.value || '',
                numero: document.getElementById('numero')?.value || '',
                complemento: document.getElementById('complemento')?.value || '',
                bairro: document.getElementById('bairro')?.value || '',
                cidade: document.getElementById('cidade')?.value || '',
                estado: document.getElementById('estado')?.value || '',
                cep: document.getElementById('cep')?.value || '',
                observacoes: document.getElementById('observacoes')?.value || ''
            };
            
            // Remove máscaras
            if (dados.cnpj) dados.cnpj = dados.cnpj.replace(/[^\d]+/g, '');
            if (dados.cep) dados.cep = dados.cep.replace(/[^\d]+/g, '');
            if (dados.telefone) dados.telefone = dados.telefone.replace(/[^\d]+/g, '');
            if (dados.celular) dados.celular = dados.celular.replace(/[^\d]+/g, '');
            
            Logger.debug('Dados do formulário:', dados);
            
            const response = await axios.post('../api/clientes/salvar.php', dados);
            Logger.debug('Resposta do servidor:', response);
            
            if (response.data.success) {
                Toast.success(response.data.message || 'Cliente salvo com sucesso');
                this.modal.hide();
                await this.carregarClientes();
                this.form.reset();
            } else {
                throw new Error(response.data.message || 'Erro ao salvar cliente');
            }
        } catch (error) {
            Logger.error('Erro ao salvar cliente', error);
            Toast.error(error.response?.data?.message || error.message || 'Erro ao salvar cliente');
        }
    }
} 
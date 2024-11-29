class ContratosController {
    constructor() {
        Logger.info('Inicializando ContratosController');
        try {
            this.service = new ContratosService();
            this.dataTable = null;
            this.initEventListeners();
            this.initDataTable();
            this.carregarClientes();
        } catch (error) {
            Logger.error('Erro ao inicializar ContratosController', error);
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

            this.dataTable = $('#tabelaContratos').DataTable({
                processing: true,
                serverSide: false,
                language: {
                    url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json'
                },
                columns: [
                    { data: 'numero_contrato' },
                    { data: 'cliente_nome' },
                    { 
                        data: 'valor_total',
                        render: (data) => formatarMoeda(data)
                    },
                    { data: 'data_inicio' },
                    { data: 'data_fim' },
                    { 
                        data: 'status',
                        render: (data) => {
                            const badges = {
                                'ativo': 'success',
                                'pendente': 'warning',
                                'cancelado': 'danger',
                                'finalizado': 'info'
                            };
                            return `<span class="badge bg-${badges[data] || 'secondary'}">${data}</span>`;
                        }
                    },
                    {
                        data: 'id',
                        render: (data) => `
                            <div class="btn-group">
                                <button type="button" class="btn btn-sm btn-info" onclick="window.contratosController.visualizar(${data})" title="Visualizar">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-danger" onclick="window.contratosController.excluir(${data})" title="Excluir">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `
                    }
                ]
            });

            Logger.debug('DataTable inicializado');
        } catch (error) {
            Logger.error('Erro ao inicializar DataTable', error);
            throw error;
        }
    }

    initEventListeners() {
        try {
            Logger.debug('Inicializando event listeners');

            // Botão Novo Contrato
            document.getElementById('btnNovoContrato').addEventListener('click', () => {
                document.getElementById('formContrato').reset();
                document.getElementById('contratoId').value = '';
                $('#modalContrato').modal('show');
            });

            // Salvar Contrato
            document.getElementById('btnSalvarContrato').addEventListener('click', async () => {
                try {
                    const form = document.getElementById('formContrato');
                    if (!form.checkValidity()) {
                        form.reportValidity();
                        return;
                    }

                    const dados = {
                        id: document.getElementById('contratoId').value || null,
                        cliente_id: document.getElementById('cliente').value,
                        numero_contrato: document.getElementById('numeroContrato').value,
                        valor_total: document.getElementById('valorTotal').value.replace(/[^\d,]/g, '').replace(',', '.'),
                        data_inicio: document.getElementById('dataInicio').value,
                        data_fim: document.getElementById('dataFim').value,
                        status: document.getElementById('status').value
                    };

                    await this.salvar(dados);
                    $('#modalContrato').modal('hide');
                    await this.listar();
                    Toast.success('Contrato salvo com sucesso!');
                } catch (error) {
                    Logger.error('Erro ao salvar contrato', error);
                    Toast.error('Erro ao salvar contrato');
                }
            });

            // Filtros
            ['filterCliente', 'filterTipo', 'filterStatus'].forEach(filterId => {
                document.getElementById(filterId)?.addEventListener('change', () => this.listar());
            });

            Logger.debug('Event listeners inicializados');
        } catch (error) {
            Logger.error('Erro ao inicializar event listeners', error);
            throw error;
        }
    }

    async carregarClientes() {
        try {
            Logger.debug('Carregando lista de clientes');
            const response = await axios.get('../api/v1/clientes');
            
            const clientes = response?.data?.data || [];
            const selectCliente = document.getElementById('cliente');
            const filterCliente = document.getElementById('filterCliente');
            
            [selectCliente, filterCliente].forEach(select => {
                if (!select) return;
                
                select.innerHTML = '<option value="">Selecione...</option>';
                clientes.forEach(cliente => {
                    const option = document.createElement('option');
                    option.value = cliente.id;
                    option.textContent = cliente.razao_social;
                    select.appendChild(option);
                });
            });
            
            Logger.debug('Lista de clientes carregada', { count: clientes.length });
        } catch (error) {
            Logger.error('Erro ao carregar clientes', error);
            Toast.error('Erro ao carregar lista de clientes');
        }
    }

    async listar() {
        try {
            Logger.debug('Listando contratos');
            
            const filtros = {
                cliente_id: document.getElementById('filterCliente')?.value,
                tipo_contrato: document.getElementById('filterTipo')?.value,
                status: document.getElementById('filterStatus')?.value
            };
            
            const response = await this.service.listar(filtros);
            this.dataTable.clear().rows.add(response.data).draw();
            
            Logger.debug('Contratos listados com sucesso', { count: response.data.length });
        } catch (error) {
            Logger.error('Erro ao listar contratos', error);
            Toast.error('Erro ao carregar contratos');
        }
    }

    async visualizar(id) {
        try {
            Logger.debug('Visualizando contrato', { id });
            
            const contrato = await this.service.buscar(id);
            
            document.getElementById('contratoId').value = contrato.id;
            document.getElementById('cliente').value = contrato.cliente_id;
            document.getElementById('numeroContrato').value = contrato.numero_contrato;
            document.getElementById('valorTotal').value = formatarMoeda(contrato.valor_total);
            document.getElementById('dataInicio').value = contrato.data_inicio;
            document.getElementById('dataFim').value = contrato.data_fim;
            document.getElementById('status').value = contrato.status;
            
            $('#modalContrato').modal('show');
            Logger.debug('Contrato carregado no formulário');
        } catch (error) {
            Logger.error('Erro ao visualizar contrato', error);
            Toast.error('Erro ao carregar dados do contrato');
        }
    }

    async salvar(dados) {
        try {
            Logger.debug('Salvando contrato', dados);
            await this.service.salvar(dados);
            Logger.debug('Contrato salvo com sucesso');
        } catch (error) {
            Logger.error('Erro ao salvar contrato', error);
            throw error;
        }
    }

    async excluir(id) {
        try {
            Logger.debug('Excluindo contrato', { id });
            
            if (!confirm('Tem certeza que deseja excluir este contrato?')) {
                return;
            }
            
            await this.service.excluir(id);
            await this.listar();
            
            Toast.success('Contrato excluído com sucesso!');
            Logger.debug('Contrato excluído com sucesso');
        } catch (error) {
            Logger.error('Erro ao excluir contrato', error);
            Toast.error('Erro ao excluir contrato');
        }
    }
}

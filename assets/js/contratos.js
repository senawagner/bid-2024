// Função para formatar moeda
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

document.addEventListener('DOMContentLoaded', async function() {
    // Verificar autenticação
    await Auth.verificarAuth();

    // Inicialização de variáveis
    let dataTable;
    const API_URL = '../api/v1/contratos';
    
    // Elementos do DOM
    const btnNovoContrato = document.getElementById('btnNovoContrato');
    const modalContrato = document.getElementById('modalContrato');
    const formContrato = document.getElementById('formContrato');
    const btnFecharModal = document.getElementById('btnFecharModal');
    const btnSalvarContrato = document.getElementById('btnSalvarContrato');
    const filterCliente = document.getElementById('filterCliente');
    const filterTipo = document.getElementById('filterTipo');
    const filterStatus = document.getElementById('filterStatus');

    // Inicialização do DataTable
    dataTable = $('#tabelaContratos').DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: API_URL,
            type: 'GET',
            data: function(d) {
                d.cliente_id = filterCliente?.value;
                d.tipo_contrato = filterTipo?.value;
                d.status = filterStatus?.value;
            },
            beforeSend: function(request) {
                const token = Auth.token;
                if (token) {
                    request.setRequestHeader('Authorization', `Bearer ${token}`);
                }
            },
            error: function(xhr, error, thrown) {
                console.error('Erro na requisição:', {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    responseText: xhr.responseText,
                    error: error,
                    thrown: thrown
                });

                if (xhr.status === 401) {
                    Auth.verificarAuth();
                } else if (xhr.status === 500) {
                    Toast.error('Erro interno do servidor. Por favor, contate o suporte.');
                } else if (xhr.responseText.includes("<br />")) {
                    // Erro PHP detectado
                    Toast.error('Erro no servidor: ' + xhr.responseText.split("<br />")[1]);
                } else {
                    Toast.error('Erro ao carregar dados: ' + (thrown || error));
                }
            },
            dataSrc: function(json) {
                if (!json.data) {
                    console.error('Resposta inválida:', json);
                    return [];
                }
                return json.data;
            }
        },
        columns: [
            { data: 'numero_contrato' },
            { data: 'cliente_nome' },
            { 
                data: 'valor',
                render: function(data) {
                    return formatarMoeda(data);
                }
            },
            { data: 'data_inicio' },
            { data: 'data_fim' },
            { 
                data: 'status',
                render: function(data) {
                    const statusClasses = {
                        'pendente': 'badge bg-warning',
                        'aprovado': 'badge bg-success',
                        'rejeitado': 'badge bg-danger',
                        'cancelado': 'badge bg-secondary'
                    };
                    return `<span class="${statusClasses[data] || 'badge bg-info'}">${data}</span>`;
                }
            },
            {
                data: 'id',
                render: function(data) {
                    return `
                        <div class="btn-group">
                            <button onclick="editarContrato(${data})" class="btn btn-sm btn-info">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="excluirContrato(${data})" class="btn btn-sm btn-danger">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                }
            }
        ],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/pt-BR.json',
            processing: '<i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Carregando...</span>'
        }
    });

    // Carregar lista de clientes
    async function carregarClientes() {
        try {
            const response = await axios.get('../api/v1/clientes');
            const data = response.data;
            
            if (data.success) {
                const options = data.data.items.map(cliente => 
                    `<option value="${cliente.id}">${cliente.razao_social}</option>`
                );
                
                filterCliente.innerHTML = '<option value="">Todos</option>' + options.join('');
                document.getElementById('clienteId').innerHTML = options.join('');
            }
        } catch (error) {
            console.error('Erro ao carregar clientes:', error.response || error);
            if (error.response?.status === 401) {
                Auth.verificarAuth();
            } else {
                Toast.error('Erro ao carregar lista de clientes: ' + (error.response?.data?.message || error.message));
            }
        }
    }

    // Event Listeners
    btnNovoContrato.addEventListener('click', () => {
        formContrato.reset();
        document.getElementById('contratoId').value = '';
        document.getElementById('modalContratoTitle').textContent = 'Novo Contrato';
        $(modalContrato).modal('show');
    });

    btnSalvarContrato.addEventListener('click', () => {
        formContrato.requestSubmit();
    });

    formContrato.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(formContrato);
        const contratoId = document.getElementById('contratoId').value;
        const data = Object.fromEntries(formData.entries());
        
        try {
            const url = contratoId ? `${API_URL}?id=${contratoId}` : API_URL;
            const method = contratoId ? 'put' : 'post';
            
            const response = await axios[method](url, data);
            
            if (response.data.success) {
                Toast.success(response.data.message);
                $(modalContrato).modal('hide');
                dataTable.ajax.reload();
            } else {
                Toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Erro ao salvar contrato:', error.response || error);
            if (error.response?.status === 401) {
                Auth.verificarAuth();
            } else {
                Toast.error('Erro ao salvar contrato: ' + (error.response?.data?.message || error.message));
            }
        }
    });

    [filterCliente, filterTipo, filterStatus].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', () => {
                dataTable.ajax.reload();
            });
        }
    });

    // Funções Globais
    window.editarContrato = async function(id) {
        try {
            const response = await axios.get(`${API_URL}?id=${id}`);
            const data = response.data;
            
            if (data.success) {
                const contrato = data.data;
                document.getElementById('contratoId').value = contrato.id;
                document.getElementById('clienteId').value = contrato.cliente_id;
                document.getElementById('numeroContrato').value = contrato.numero_contrato;
                document.getElementById('valor').value = contrato.valor;
                document.getElementById('dataInicio').value = contrato.data_inicio;
                document.getElementById('dataFim').value = contrato.data_fim || '';
                document.getElementById('status').value = contrato.status;
                document.getElementById('descricao').value = contrato.descricao || '';
                document.getElementById('observacoes').value = contrato.observacoes || '';
                
                document.getElementById('modalContratoTitle').textContent = 'Editar Contrato';
                $(modalContrato).modal('show');
            } else {
                Toast.error(data.message);
            }
        } catch (error) {
            console.error('Erro ao carregar contrato:', error.response || error);
            if (error.response?.status === 401) {
                Auth.verificarAuth();
            } else {
                Toast.error('Erro ao carregar dados do contrato: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    window.excluirContrato = async function(id) {
        if (!confirm('Tem certeza que deseja excluir este contrato?')) {
            return;
        }
        
        try {
            const response = await axios.delete(`${API_URL}?id=${id}`);
            
            if (response.data.success) {
                Toast.success(response.data.message);
                dataTable.ajax.reload();
            } else {
                Toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Erro ao excluir contrato:', error.response || error);
            if (error.response?.status === 401) {
                Auth.verificarAuth();
            } else {
                Toast.error('Erro ao excluir contrato: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    // Inicialização
    carregarClientes();
});

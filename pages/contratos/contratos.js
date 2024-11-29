document.addEventListener('DOMContentLoaded', function() {
    // Inicialização de variáveis
    let dataTable;
    const API_URL = '../api/v1/contratos';
    
    // Elementos do DOM
    const btnNovoContrato = document.getElementById('btnNovoContrato');
    const modalContrato = document.getElementById('modalContrato');
    const formContrato = document.getElementById('formContrato');
    const btnFecharModal = document.getElementById('btnFecharModal');
    const btnCancelar = document.getElementById('btnCancelar');
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
                d.cliente_id = filterCliente.value;
                d.tipo_contrato = filterTipo.value;
                d.status = filterStatus.value;
            }
        },
        columns: [
            { data: 'numero_contrato' },
            { data: 'cliente_nome' },
            { data: 'tipo_contrato' },
            { 
                data: 'valor',
                render: function(data) {
                    return formatarMoeda(data);
                }
            },
            { 
                data: 'status',
                render: function(data) {
                    const statusClasses = {
                        'ativo': 'bg-green-100 text-green-800',
                        'pendente': 'bg-yellow-100 text-yellow-800',
                        'suspenso': 'bg-red-100 text-red-800',
                        'cancelado': 'bg-gray-100 text-gray-800'
                    };
                    return `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[data]}">${data}</span>`;
                }
            },
            {
                data: 'id',
                render: function(data) {
                    return `
                        <div class="flex space-x-2">
                            <button onclick="editarContrato(${data})" class="text-blue-600 hover:text-blue-900">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button onclick="excluirContrato(${data})" class="text-red-600 hover:text-red-900">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    `;
                }
            }
        ],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/pt-BR.json'
        }
    });

    // Carregar lista de clientes
    async function carregarClientes() {
        try {
            const response = await fetch('../api/v1/clientes');
            const data = await response.json();
            
            if (data.success) {
                const options = data.data.items.map(cliente => 
                    `<option value="${cliente.id}">${cliente.razao_social}</option>`
                );
                
                filterCliente.innerHTML = '<option value="">Todos</option>' + options.join('');
                document.getElementById('cliente_id').innerHTML = options.join('');
            }
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            mostrarToast('Erro ao carregar lista de clientes', 'error');
        }
    }

    // Event Listeners
    btnNovoContrato.addEventListener('click', () => {
        formContrato.reset();
        document.getElementById('contratoId').value = '';
        document.getElementById('modalTitle').textContent = 'Novo Contrato';
        modalContrato.classList.remove('hidden');
    });

    [btnFecharModal, btnCancelar].forEach(btn => {
        btn.addEventListener('click', () => {
            modalContrato.classList.add('hidden');
        });
    });

    formContrato.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(formContrato);
        const contratoId = document.getElementById('contratoId').value;
        const data = Object.fromEntries(formData.entries());
        
        try {
            const url = contratoId ? `${API_URL}?id=${contratoId}` : API_URL;
            const method = contratoId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                mostrarToast(result.message, 'success');
                modalContrato.classList.add('hidden');
                dataTable.ajax.reload();
            } else {
                mostrarToast(result.message, 'error');
            }
        } catch (error) {
            console.error('Erro ao salvar contrato:', error);
            mostrarToast('Erro ao salvar contrato', 'error');
        }
    });

    [filterCliente, filterTipo, filterStatus].forEach(filter => {
        filter.addEventListener('change', () => {
            dataTable.ajax.reload();
        });
    });

    // Funções Globais
    window.editarContrato = async function(id) {
        try {
            const response = await fetch(`${API_URL}?id=${id}`);
            const data = await response.json();
            
            if (data.success) {
                const contrato = data.data;
                document.getElementById('contratoId').value = contrato.id;
                document.getElementById('cliente_id').value = contrato.cliente_id;
                document.getElementById('numero_contrato').value = contrato.numero_contrato;
                document.getElementById('tipo_contrato').value = contrato.tipo_contrato;
                document.getElementById('valor').value = contrato.valor;
                document.getElementById('data_inicio').value = contrato.data_inicio;
                document.getElementById('data_fim').value = contrato.data_fim || '';
                document.getElementById('frequencia').value = contrato.frequencia || '';
                document.getElementById('status').value = contrato.status;
                document.getElementById('descricao').value = contrato.descricao || '';
                document.getElementById('observacoes').value = contrato.observacoes || '';
                
                document.getElementById('modalTitle').textContent = 'Editar Contrato';
                modalContrato.classList.remove('hidden');
            } else {
                mostrarToast(data.message, 'error');
            }
        } catch (error) {
            console.error('Erro ao carregar contrato:', error);
            mostrarToast('Erro ao carregar dados do contrato', 'error');
        }
    };

    window.excluirContrato = async function(id) {
        if (!confirm('Tem certeza que deseja excluir este contrato?')) {
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}?id=${id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                mostrarToast(data.message, 'success');
                dataTable.ajax.reload();
            } else {
                mostrarToast(data.message, 'error');
            }
        } catch (error) {
            console.error('Erro ao excluir contrato:', error);
            mostrarToast('Erro ao excluir contrato', 'error');
        }
    };

    // Inicialização
    carregarClientes();
});

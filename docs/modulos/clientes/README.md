# Módulo de Clientes

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Módulo](#estrutura-do-módulo)
3. [Backend](#backend)
4. [Frontend](#frontend)
5. [Fluxo de Dados](#fluxo-de-dados)
6. [Guia de Implementação](#guia-de-implementação)

## Visão Geral

O módulo de Clientes implementa um CRUD completo para gestão de clientes, seguindo o padrão MVC e utilizando:
- Backend: PHP com PDO
- Frontend: JavaScript (ES6+)
- Interface: HTML5 + Bootstrap 5
- Componentes: DataTables, Toastr, Axios
- Validações: Frontend e Backend
- Máscaras: jQuery Mask

### Funcionalidades
- Listagem paginada com busca
- Cadastro/Edição via modal
- Exclusão com validação de vínculos
- Validação de CNPJ
- Busca automática de CEP
- Exportação de dados

## Estrutura do Módulo

```
bid/
├── api/clientes/
│   ├── ClienteModel.php    # Modelo de dados
│   ├── listar.php          # Endpoint de listagem
│   ├── buscar.php          # Endpoint de busca
│   ├── salvar.php          # Endpoint de save
│   └── excluir.php         # Endpoint de exclusão
├── assets/js/
│   ├── controllers/
│   │   └── ClienteController.js
│   └── services/
│       └── ClienteService.js
└── pages/
    └── clientes.html
```

## Backend

### ClienteModel.php

Classe responsável pela lógica de negócios e acesso ao banco de dados.

#### Métodos Principais

```php
class ClienteModel {
    public function listar($search = '', $page = 1, $limit = 10)
    public function buscar(int $id)
    public function salvar(array $dados)
    public function excluir(int $id)
    public function podeExcluir(int $id): bool
    public function cnpjExiste(string $cnpj, ?int $id = null)
    public function formatarDados($cliente)
}
```

#### Estrutura da Tabela
```sql
CREATE TABLE clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(14) UNIQUE,
    inscricao_estadual VARCHAR(20),
    email VARCHAR(255),
    telefone VARCHAR(20),
    celular VARCHAR(20),
    cep VARCHAR(8),
    endereco VARCHAR(255),
    numero VARCHAR(10),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado CHAR(2),
    observacoes TEXT,
    ativo TINYINT(1) DEFAULT 1,
    deleted_at DATETIME NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NULL
);
```

### Endpoints

#### listar.php
- Método: GET
- Parâmetros:
  - search: string (opcional)
  - start: int (paginação)
  - length: int (registros por página)
- Retorno:
```json
{
    "draw": 1,
    "recordsTotal": 100,
    "recordsFiltered": 10,
    "data": [
        {
            "id": 1,
            "razao_social": "Empresa X",
            "cnpj": "00.000.000/0001-00",
            ...
        }
    ]
}
```

## Frontend

### ClienteController.js

Controlador responsável pela lógica da interface e interação com usuário.

#### Inicialização
```javascript
class ClienteController {
    constructor() {
        this.service = new ClienteService();
        this.dataTable = null;
        this.initEventListeners();
        this.initDataTable();
        this.initMasks();
        this.initCepSearch();
    }
}
```

#### DataTables Configuration
```javascript
this.dataTable = $('#tabelaClientes').DataTable({
    language: {
        url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json'
    },
    processing: true,
    serverSide: true,
    ajax: {
        url: `${this.service.baseUrl}/listar.php`,
        type: 'GET',
        error: (xhr) => {
            Logger.error('Erro ao carregar dados', xhr);
            Toast.error('Erro ao carregar dados');
        }
    },
    columns: [
        { data: 'id' },
        { data: 'razao_social' },
        { data: 'nome_fantasia' },
        { data: 'cnpj' },
        { data: 'email' },
        { data: 'telefone' },
        { 
            data: null,
            render: (data) => `${data.cidade}/${data.estado}`
        },
        {
            data: null,
            render: (data) => `
                <div class="btn-group">
                    <button class="btn btn-sm btn-info" onclick="clienteController.editar(${data.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="clienteController.excluir(${data.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `
        }
    ]
});
```

#### Máscaras e Validações
```javascript
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
                Logger.error('Erro ao buscar CEP:', error);
            }
        }
    });
}
```

### ClienteService.js

Serviço responsável pela comunicação com a API.

```javascript
class ClienteService {
    constructor() {
        this.baseUrl = '../api/clientes';
    }

    async listar() {
        const response = await axios.get(`${this.baseUrl}/listar.php`);
        return response.data.data;
    }

    async buscar(id) {
        const response = await axios.get(`${this.baseUrl}/buscar.php?id=${id}`);
        return response.data.cliente;
    }

    async salvar(dados) {
        const response = await axios.post(`${this.baseUrl}/salvar.php`, dados);
        return response.data;
    }

    async excluir(id) {
        const response = await axios.post(`${this.baseUrl}/excluir.php`, { id });
        return response.data;
    }

    async buscarCep(cep) {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        return response.data;
    }
}
```

## Fluxo de Dados

### Listagem
1. Página carrega e inicializa ClienteController
2. DataTables faz requisição para listar.php
3. Backend consulta banco e retorna dados paginados
4. DataTables renderiza dados na tabela

### Cadastro/Edição
1. Usuário clica em "Novo" ou "Editar"
2. Modal é aberto (vazio ou com dados do cliente)
3. Usuário preenche/altera dados
4. Ao salvar:
   - Frontend valida dados
   - Requisição para salvar.php
   - Backend valida e salva
   - Modal fecha e tabela atualiza

### Exclusão
1. Usuário clica em excluir
2. Confirmação via SweetAlert
3. Requisição para excluir.php
4. Backend verifica vínculos
5. Soft delete no registro
6. Tabela atualiza

## Guia de Implementação

### 1. Preparação do Banco
```sql
-- Criar tabela clientes
CREATE TABLE clientes (
    -- ... (estrutura já documentada acima)
);

-- Índices recomendados
CREATE INDEX idx_clientes_ativo ON clientes(ativo);
CREATE INDEX idx_clientes_deleted_at ON clientes(deleted_at);
CREATE INDEX idx_clientes_cnpj ON clientes(cnpj);
```

### 2. Backend
1. Criar pasta api/clientes/
2. Implementar ClienteModel.php
3. Criar endpoints (listar, buscar, salvar, excluir)
4. Testar endpoints via Postman

### 3. Frontend
1. Criar página HTML com estrutura básica
2. Implementar ClienteService.js
3. Implementar ClienteController.js
4. Adicionar validações e máscaras
5. Testar integração completa

### 4. Testes Recomendados
- Listagem com e sem filtros
- Paginação
- CRUD completo
- Validações de CNPJ
- Busca de CEP
- Exclusão com vínculos
- Máscaras e formatações
- Exportação de dados

## Observações Importantes

### Segurança
- Validações em ambos os lados (front/back)
- Sanitização de inputs
- Proteção contra SQL Injection via PDO
- Verificação de permissões

### Performance
- Índices no banco
- Paginação server-side
- Soft delete
- Cache de consultas frequentes

### Manutenção
- Logs detalhados
- Comentários explicativos
- Padrão de código consistente
- Documentação atualizada 
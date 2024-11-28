# Módulo de Faturas

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura](#estrutura)
3. [Modelo de Dados](#modelo-de-dados)
4. [Backend](#backend)
5. [Frontend](#frontend)
6. [Processos Automáticos](#processos-automáticos)
7. [Integrações](#integrações)

## Visão Geral

O módulo de Faturas gerencia todo o ciclo financeiro do sistema, incluindo:
- Geração automática de faturas
- Controle de pagamentos
- Gestão de recebimentos
- Relatórios financeiros
- Integração com contratos
- Notificações automáticas

### Funcionalidades Principais
- CRUD completo de faturas
- Geração automática mensal
- Controle de vencimentos
- Gestão de pagamentos
- Relatórios gerenciais
- Histórico financeiro

## Estrutura

```
bid/
├── api/faturas/
│   ├── FaturaModel.php     # Modelo principal
│   ├── listar.php          # Endpoint de listagem
│   ├── buscar.php          # Endpoint de busca
│   ├── salvar.php          # Endpoint de save
│   ├── excluir.php         # Endpoint de exclusão
│   ├── gerar.php           # Geração automática
│   └── relatorios.php      # Relatórios
├── assets/js/
│   ├── controllers/
│   │   └── FaturaController.js
│   └── services/
│       └── FaturaService.js
└── pages/
    └── faturas.html
```

## Modelo de Dados

### Estrutura das Tabelas

```sql
CREATE TABLE faturas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero VARCHAR(20) UNIQUE NOT NULL,
    cliente_id INT NOT NULL,
    contrato_id INT NULL,
    tipo ENUM('mensalidade', 'servico', 'outros') NOT NULL,
    status ENUM('pendente', 'pago', 'cancelado', 'atrasado') NOT NULL,
    data_emissao DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    valor_pago DECIMAL(10,2) NULL,
    forma_pagamento VARCHAR(50) NULL,
    observacoes TEXT NULL,
    deleted_at DATETIME NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (contrato_id) REFERENCES contratos(id)
);

CREATE TABLE fatura_itens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fatura_id INT NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL,
    valor_unitario DECIMAL(10,2) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (fatura_id) REFERENCES faturas(id)
);

CREATE TABLE fatura_historico (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fatura_id INT NOT NULL,
    usuario_id INT NOT NULL,
    tipo_alteracao ENUM('criacao', 'pagamento', 'cancelamento', 'alteracao') NOT NULL,
    descricao TEXT NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fatura_id) REFERENCES faturas(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

## Backend

### FaturaModel.php

```php
class FaturaModel {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    public function gerarNumeroFatura() {
        $ano = date('Y');
        $mes = date('m');
        
        $sql = "SELECT MAX(CAST(SUBSTRING(numero, 1, 6) AS UNSIGNED)) as ultimo
                FROM faturas 
                WHERE numero LIKE :prefixo";
                
        $result = $this->db->query($sql, [
            'prefixo' => "$ano$mes%"
        ]);
        
        $ultimo = $result[0]['ultimo'] ?? 0;
        $proximo = str_pad($ultimo + 1, 6, '0', STR_PAD_LEFT);
        
        return $proximo . '/' . $ano . $mes;
    }
    
    public function gerarFaturasMensais() {
        try {
            $this->db->beginTransaction();
            
            // Busca contratos ativos
            $sql = "SELECT * FROM contratos 
                    WHERE status = 'vigente' 
                    AND deleted_at IS NULL";
            
            $contratos = $this->db->query($sql);
            
            foreach ($contratos as $contrato) {
                // Verifica se já existe fatura para o mês
                if (!$this->existeFaturaMes($contrato['id'])) {
                    $this->gerarFaturaContrato($contrato);
                }
            }
            
            $this->db->commit();
            
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
    
    public function registrarPagamento($id, $dados) {
        try {
            $this->db->beginTransaction();
            
            // Atualiza fatura
            $sql = "UPDATE faturas SET 
                    status = 'pago',
                    data_pagamento = :data_pagamento,
                    valor_pago = :valor_pago,
                    forma_pagamento = :forma_pagamento,
                    atualizado_em = CURRENT_TIMESTAMP
                    WHERE id = :id";
                    
            $this->db->execute($sql, [
                'id' => $id,
                'data_pagamento' => $dados['data_pagamento'],
                'valor_pago' => $dados['valor_pago'],
                'forma_pagamento' => $dados['forma_pagamento']
            ]);
            
            // Registra histórico
            $this->registrarHistorico($id, 'pagamento', 'Pagamento registrado');
            
            $this->db->commit();
            
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
    
    // ... outros métodos
}
```

## Frontend

### FaturaController.js

```javascript
class FaturaController {
    constructor() {
        this.service = new FaturaService();
        this.dataTable = null;
        this.initDataTable();
        this.initEventListeners();
        this.initMasks();
    }
    
    initDataTable() {
        this.dataTable = $('#tabelaFaturas').DataTable({
            processing: true,
            serverSide: true,
            ajax: `${this.service.baseUrl}/listar.php`,
            columns: [
                { data: 'numero' },
                { data: 'cliente.razao_social' },
                { 
                    data: 'valor_total',
                    render: (data) => this.formatMoney(data)
                },
                { data: 'data_vencimento' },
                {
                    data: 'status',
                    render: (data) => this.renderStatus(data)
                },
                { 
                    data: null,
                    render: (data) => this.renderAcoes(data)
                }
            ]
        });
    }
    
    async registrarPagamento(id) {
        try {
            const fatura = await this.service.buscar(id);
            const modal = new bootstrap.Modal('#modalPagamento');
            
            document.getElementById('fatura_id').value = id;
            document.getElementById('valor_total').value = 
                this.formatMoney(fatura.valor_total);
            
            modal.show();
        } catch (error) {
            Logger.error('Erro ao carregar fatura', error);
            Toast.error('Erro ao carregar dados do pagamento');
        }
    }
    
    // ... outros métodos
}
```

## Processos Automáticos

### Geração Mensal
1. Cron job diário
2. Verifica contratos ativos
3. Gera faturas pendentes
4. Envia notificações

### Atualização de Status
1. Verifica vencimentos
2. Marca faturas atrasadas
3. Envia lembretes
4. Atualiza dashboard

### Relatórios
1. Faturamento mensal
2. Previsão de recebimentos
3. Inadimplência
4. Performance financeira

## Integrações

### Com Outros Módulos
- Clientes: Dados de cobrança
- Contratos: Valores e serviços
- Dashboard: Indicadores financeiros
- Ordens de Serviço: Serviços extras

### Notificações
- Email automático
- Lembretes de vencimento
- Confirmação de pagamento
- Alertas de atraso

## Observações Importantes

### Financeiro
- Controle de inadimplência
- Juros e multas
- Descontos
- Formas de pagamento

### Segurança
- Registro de alterações
- Backup de dados
- Controle de acesso
- Auditoria

### Performance
- Cache de relatórios
- Otimização de queries
- Processamento em lote 
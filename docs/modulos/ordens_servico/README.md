# Módulo de Ordens de Serviço (OS)

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura](#estrutura)
3. [Modelo de Dados](#modelo-de-dados)
4. [Backend](#backend)
5. [Frontend](#frontend)
6. [Fluxo de Trabalho](#fluxo-de-trabalho)
7. [Integrações](#integrações)

## Visão Geral

O módulo de Ordens de Serviço gerencia todo o ciclo de atendimento, desde a abertura até o encerramento, incluindo:
- Abertura de chamados
- Acompanhamento de status
- Registro de atividades
- Controle de tempo
- Relatórios de atendimento
- Avaliação de satisfação

### Funcionalidades Principais
- CRUD completo de OS
- Workflow de aprovação
- Timeline de atividades
- Anexos e documentos
- Notificações automáticas
- Métricas de SLA

## Estrutura

```
bid/
├── api/ordens_servico/
│   ├── OrdemServicoModel.php   # Modelo principal
│   ├── listar.php              # Endpoint de listagem
│   ├── buscar.php              # Endpoint de busca
│   ├── salvar.php              # Endpoint de save
│   ├── excluir.php             # Endpoint de exclusão
│   ├── atividades.php          # Gestão de atividades
│   └── anexos.php              # Gestão de anexos
├── assets/js/
│   ├── controllers/
│   │   └── OrdemServicoController.js
│   └── services/
│       └── OrdemServicoService.js
└── pages/
    └── ordens_servico.html
```

## Modelo de Dados

### Estrutura das Tabelas

```sql
CREATE TABLE ordens_servico (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero VARCHAR(20) UNIQUE NOT NULL,
    cliente_id INT NOT NULL,
    contrato_id INT NULL,
    tipo ENUM('suporte', 'instalacao', 'manutencao', 'outros') NOT NULL,
    prioridade ENUM('baixa', 'media', 'alta', 'urgente') NOT NULL,
    status ENUM('aberta', 'em_andamento', 'pendente', 'concluida', 'cancelada') NOT NULL,
    descricao TEXT NOT NULL,
    solucao TEXT NULL,
    data_abertura DATETIME NOT NULL,
    data_inicio DATETIME NULL,
    data_fim DATETIME NULL,
    tempo_gasto INT NULL, -- em minutos
    responsavel_id INT NULL,
    avaliacao INT NULL,
    comentario_avaliacao TEXT NULL,
    deleted_at DATETIME NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (contrato_id) REFERENCES contratos(id),
    FOREIGN KEY (responsavel_id) REFERENCES usuarios(id)
);

CREATE TABLE os_atividades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    os_id INT NOT NULL,
    usuario_id INT NOT NULL,
    tipo ENUM('comentario', 'status', 'atribuicao') NOT NULL,
    descricao TEXT NOT NULL,
    tempo_gasto INT NULL, -- em minutos
    privado BOOLEAN DEFAULT FALSE,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (os_id) REFERENCES ordens_servico(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE os_anexos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    os_id INT NOT NULL,
    usuario_id INT NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    tipo_arquivo VARCHAR(100) NOT NULL,
    tamanho INT NOT NULL,
    caminho VARCHAR(255) NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (os_id) REFERENCES ordens_servico(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

## Backend

### OrdemServicoModel.php

```php
class OrdemServicoModel {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    public function gerarNumeroOS() {
        $ano = date('Y');
        $sql = "SELECT MAX(CAST(SUBSTRING(numero, 1, 6) AS UNSIGNED)) as ultimo
                FROM ordens_servico 
                WHERE numero LIKE :ano";
                
        $result = $this->db->query($sql, ['ano' => "$ano%"]);
        $ultimo = $result[0]['ultimo'] ?? 0;
        $proximo = str_pad($ultimo + 1, 6, '0', STR_PAD_LEFT);
        
        return $proximo . '/' . $ano;
    }
    
    public function salvar($dados) {
        try {
            $this->db->beginTransaction();
            
            if (empty($dados['id'])) {
                $dados['numero'] = $this->gerarNumeroOS();
                $dados['data_abertura'] = date('Y-m-d H:i:s');
                $dados['status'] = 'aberta';
            }
            
            // Validações
            $this->validarDados($dados);
            
            // Salva OS
            $id = $this->salvarOS($dados);
            
            // Registra atividade
            $this->registrarAtividade($id, [
                'tipo' => empty($dados['id']) ? 'status' : 'comentario',
                'descricao' => empty($dados['id']) ? 
                    'OS aberta' : 'OS atualizada',
                'privado' => false
            ]);
            
            $this->db->commit();
            return $id;
            
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
    
    public function atualizarStatus($id, $status, $comentario = '') {
        try {
            $this->db->beginTransaction();
            
            // Atualiza status
            $sql = "UPDATE ordens_servico SET 
                    status = :status,
                    atualizado_em = CURRENT_TIMESTAMP
                    WHERE id = :id";
                    
            $this->db->execute($sql, [
                'id' => $id,
                'status' => $status
            ]);
            
            // Registra atividade
            $this->registrarAtividade($id, [
                'tipo' => 'status',
                'descricao' => "Status alterado para: $status\n$comentario",
                'privado' => false
            ]);
            
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

### OrdemServicoController.js

```javascript
class OrdemServicoController {
    constructor() {
        this.service = new OrdemServicoService();
        this.dataTable = null;
        this.initDataTable();
        this.initEventListeners();
        this.initDropzone();
    }
    
    initDataTable() {
        this.dataTable = $('#tabelaOS').DataTable({
            processing: true,
            serverSide: true,
            ajax: `${this.service.baseUrl}/listar.php`,
            columns: [
                { data: 'numero' },
                { data: 'cliente.razao_social' },
                { 
                    data: 'prioridade',
                    render: (data) => this.renderPrioridade(data)
                },
                {
                    data: 'status',
                    render: (data) => this.renderStatus(data)
                },
                { data: 'data_abertura' },
                { 
                    data: null,
                    render: (data) => this.renderAcoes(data)
                }
            ]
        });
    }
    
    async registrarAtividade(id, dados) {
        try {
            await this.service.registrarAtividade(id, dados);
            await this.carregarTimeline(id);
            Toast.success('Atividade registrada com sucesso');
        } catch (error) {
            Logger.error('Erro ao registrar atividade', error);
            Toast.error('Erro ao registrar atividade');
        }
    }
    
    // ... outros métodos
}
```

## Fluxo de Trabalho

### Abertura de OS
1. Usuário preenche formulário
2. Sistema:
   - Gera número único
   - Define status inicial
   - Registra data/hora
   - Notifica responsáveis

### Atendimento
1. Técnico assume OS
2. Registra atividades
3. Atualiza status
4. Anexa documentos
5. Registra tempo

### Encerramento
1. Técnico:
   - Registra solução
   - Anexa evidências
   - Atualiza status
2. Cliente:
   - Valida solução
   - Avalia atendimento

## Integrações

### Com Outros Módulos
- Clientes: Dados cadastrais
- Contratos: Vinculação de OS
- Faturas: Serviços extras
- Dashboard: Indicadores

### Notificações
- Email
- SMS
- Push 
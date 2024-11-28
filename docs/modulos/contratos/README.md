# Módulo de Contratos

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura](#estrutura)
3. [Modelo de Dados](#modelo-de-dados)
4. [Backend](#backend)
5. [Frontend](#frontend)
6. [Fluxos de Processo](#fluxos-de-processo)
7. [Integrações](#integrações)

## Visão Geral

O módulo de Contratos gerencia todo o ciclo de vida dos contratos no sistema, incluindo:
- Geração automática de contratos
- Controle de versões
- Gestão de vigências
- Renovações automáticas
- Integrações com outros módulos

### Funcionalidades Principais
- CRUD completo de contratos
- Geração de documentos em PDF
- Controle de status e vigência
- Histórico de alterações
- Alertas de vencimento
- Vinculação com clientes e serviços

## Estrutura

```
bid/
├── api/contratos/
│   ├── ContratoModel.php   # Modelo principal
│   ├── listar.php          # Endpoint de listagem
│   ├── buscar.php          # Endpoint de busca
│   ├── salvar.php          # Endpoint de save
│   ├── excluir.php         # Endpoint de exclusão
│   ├── gerar-pdf.php       # Geração de PDF
│   └── renovar.php         # Renovação automática
├── assets/js/
│   ├── controllers/
│   │   └── ContratoController.js
│   └── services/
│       └── ContratoService.js
└── pages/
    └── contratos.html
```

## Modelo de Dados

### Estrutura da Tabela Principal
```sql
CREATE TABLE contratos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero VARCHAR(20) UNIQUE NOT NULL,
    cliente_id INT NOT NULL,
    tipo_contrato ENUM('servico', 'produto', 'manutencao') NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    valor_mensal DECIMAL(10,2) NOT NULL,
    status ENUM('pendente', 'vigente', 'cancelado', 'encerrado') NOT NULL,
    renovacao_automatica BOOLEAN DEFAULT FALSE,
    prazo_renovacao INT DEFAULT 30,
    observacoes TEXT,
    versao INT DEFAULT 1,
    ativo BOOLEAN DEFAULT TRUE,
    deleted_at DATETIME NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE contrato_servicos (
    contrato_id INT NOT NULL,
    servico_id INT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    quantidade INT DEFAULT 1,
    PRIMARY KEY (contrato_id, servico_id),
    FOREIGN KEY (contrato_id) REFERENCES contratos(id),
    FOREIGN KEY (servico_id) REFERENCES servicos(id)
);

CREATE TABLE contrato_historico (
    id INT PRIMARY KEY AUTO_INCREMENT,
    contrato_id INT NOT NULL,
    tipo_alteracao ENUM('criacao', 'edicao', 'renovacao', 'cancelamento') NOT NULL,
    descricao TEXT NOT NULL,
    usuario_id INT NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contrato_id) REFERENCES contratos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

## Backend

### ContratoModel.php

```php
class ContratoModel {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    public function gerarNumeroContrato() {
        $ano = date('Y');
        $sql = "SELECT MAX(CAST(SUBSTRING(numero, 1, 4) AS UNSIGNED)) as ultimo
                FROM contratos 
                WHERE numero LIKE :ano";
                
        $result = $this->db->query($sql, ['ano' => "$ano%"]);
        $ultimo = $result[0]['ultimo'] ?? 0;
        $proximo = str_pad($ultimo + 1, 4, '0', STR_PAD_LEFT);
        
        return $proximo . '/' . $ano;
    }
    
    public function salvar($dados) {
        try {
            $this->db->beginTransaction();
            
            if (empty($dados['id'])) {
                $dados['numero'] = $this->gerarNumeroContrato();
            }
            
            // Validações
            $this->validarDados($dados);
            
            // Salva contrato
            $id = $this->salvarContrato($dados);
            
            // Salva serviços vinculados
            if (!empty($dados['servicos'])) {
                $this->salvarServicos($id, $dados['servicos']);
            }
            
            // Registra histórico
            $this->registrarHistorico($id, empty($dados['id']) ? 'criacao' : 'edicao');
            
            $this->db->commit();
            return $id;
            
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
    
    public function renovar($id) {
        try {
            $this->db->beginTransaction();
            
            $contrato = $this->buscar($id);
            if (!$contrato) {
                throw new Exception("Contrato não encontrado");
            }
            
            // Cria nova versão
            $novoContrato = $this->criarNovaVersao($contrato);
            
            // Registra histórico
            $this->registrarHistorico($id, 'renovacao');
            
            $this->db->commit();
            return $novoContrato['id'];
            
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
    
    // ... outros métodos
}
```

## Frontend

### ContratoController.js

```javascript
class ContratoController {
    constructor() {
        this.service = new ContratoService();
        this.dataTable = null;
        this.initDataTable();
        this.initEventListeners();
        this.initMasks();
    }
    
    async carregarClientes() {
        const clientes = await this.service.listarClientes();
        const select = document.getElementById('cliente_id');
        select.innerHTML = '<option value="">Selecione...</option>';
        
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = cliente.razao_social;
            select.appendChild(option);
        });
    }
    
    async gerarPDF(id) {
        try {
            const url = await this.service.gerarPDF(id);
            window.open(url, '_blank');
        } catch (error) {
            Logger.error('Erro ao gerar PDF', error);
            Toast.error('Erro ao gerar contrato');
        }
    }
    
    // ... outros métodos
}
```

## Fluxos de Processo

### Novo Contrato
1. Usuário acessa formulário
2. Seleciona cliente
3. Adiciona serviços
4. Define vigência
5. Sistema:
   - Gera número único
   - Calcula valores
   - Cria registro
   - Gera PDF
   - Registra histórico

### Renovação
1. Sistema identifica contratos próximos ao vencimento
2. Para renovação automática:
   - Cria nova versão
   - Atualiza vigência
   - Mantém condições
   - Notifica partes
3. Para renovação manual:
   - Notifica responsáveis
   - Aguarda ação manual
   - Permite ajustes

## Integrações

### Com Outros Módulos
- Clientes: Dados cadastrais
- Serviços: Itens do contrato
- Faturas: Geração automática
- Dashboard: Alertas e calendário

### Com Sistemas Externos
- Geração de PDF
- Assinatura digital
- Notificações por email
- Backup em nuvem

## Observações Importantes

### Segurança
- Validação de datas e valores
- Controle de versões
- Registro de alterações
- Backup dos documentos

### Performance
- Cache de dados frequentes
- Otimização de queries
- Geração assíncrona de PDFs

### Manutenção
- Logs detalhados
- Documentação atualizada
- Versionamento de templates 
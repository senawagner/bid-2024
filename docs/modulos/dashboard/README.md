# Módulo de Dashboard

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura](#estrutura)
3. [Componentes](#componentes)
4. [Backend](#backend)
5. [Frontend](#frontend)
6. [Calendário de Eventos](#calendário-de-eventos)

## Visão Geral

O Dashboard é a página inicial do sistema após o login, fornecendo:
- Cards com estatísticas gerais
- Calendário de eventos
- Gráficos de desempenho
- Alertas e notificações

### Funcionalidades Principais
- Contadores em tempo real
- Calendário interativo
- Gráficos dinâmicos
- Visão geral do sistema

## Estrutura

```
bid/
├── api/dashboard/
│   ├── stats.php           # Estatísticas gerais
│   ├── eventos.php         # Dados do calendário
│   └── graficos.php        # Dados para gráficos
├── assets/js/
│   ├── controllers/
│   │   └── DashboardController.js
│   └── services/
│       └── DashboardService.js
└── pages/
    └── dashboard.html
```

## Componentes

### Cards Estatísticos
- Total de Clientes Ativos
- Contratos em Vigência
- Ordens de Serviço Abertas
- Faturas Pendentes

### Calendário
- Vencimentos de Contratos
- Datas de Pagamento
- Eventos Importantes
- Agendamentos

### Gráficos
- Faturamento Mensal
- Status de Ordens de Serviço
- Distribuição de Clientes
- Performance Financeira

## Backend

### stats.php

Endpoint responsável pelas estatísticas gerais do sistema.

```php
<?php
class DashboardStats {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    public function getStats() {
        return [
            'clientes' => $this->getClientesAtivos(),
            'contratos' => $this->getContratosVigentes(),
            'ordens' => $this->getOrdensAbertas(),
            'faturas' => $this->getFaturasPendentes()
        ];
    }
    
    private function getClientesAtivos() {
        $sql = "SELECT COUNT(*) as total 
                FROM clientes 
                WHERE ativo = 1 
                AND deleted_at IS NULL";
        $result = $this->db->query($sql);
        return $result[0]['total'] ?? 0;
    }
    
    private function getContratosVigentes() {
        $sql = "SELECT COUNT(*) as total 
                FROM contratos 
                WHERE status = 'vigente' 
                AND deleted_at IS NULL";
        $result = $this->db->query($sql);
        return $result[0]['total'] ?? 0;
    }
    
    // ... outros métodos de contagem
}
```

### eventos.php

Gerencia os eventos do calendário.

```php
class EventosCalendario {
    private $db;
    
    public function getEventos($inicio, $fim) {
        $sql = "SELECT 
                    'contrato' as tipo,
                    id,
                    numero as titulo,
                    data_vencimento as data,
                    'warning' as classe
                FROM contratos 
                WHERE data_vencimento BETWEEN :inicio AND :fim
                AND deleted_at IS NULL
                
                UNION
                
                SELECT 
                    'fatura' as tipo,
                    id,
                    numero as titulo,
                    data_vencimento as data,
                    CASE 
                        WHEN status = 'atrasado' THEN 'danger'
                        ELSE 'info'
                    END as classe
                FROM faturas
                WHERE data_vencimento BETWEEN :inicio AND :fim";
                
        return $this->db->query($sql, [
            'inicio' => $inicio,
            'fim' => $fim
        ]);
    }
}
```

## Frontend

### DashboardController.js

```javascript
class DashboardController {
    constructor() {
        this.service = new DashboardService();
        this.calendar = null;
        this.charts = {};
        
        this.initCards();
        this.initCalendar();
        this.initCharts();
        this.startAutoRefresh();
    }
    
    async initCards() {
        try {
            const stats = await this.service.getStats();
            this.updateCards(stats);
        } catch (error) {
            Logger.error('Erro ao carregar estatísticas', error);
            Toast.error('Erro ao carregar dados do dashboard');
        }
    }
    
    initCalendar() {
        this.calendar = new FullCalendar.Calendar(
            document.getElementById('calendar'), {
                initialView: 'dayGridMonth',
                locale: 'pt-br',
                events: (info, successCallback, failureCallback) => {
                    this.service.getEventos(
                        info.start.toISOString(),
                        info.end.toISOString()
                    )
                    .then(successCallback)
                    .catch(failureCallback);
                },
                eventClick: (info) => this.handleEventClick(info)
            }
        );
        
        this.calendar.render();
    }
    
    // ... outros métodos
}
```

### DashboardService.js

```javascript
class DashboardService {
    constructor() {
        this.baseUrl = '../api/dashboard';
    }
    
    async getStats() {
        const response = await axios.get(`${this.baseUrl}/stats.php`);
        return response.data;
    }
    
    async getEventos(inicio, fim) {
        const response = await axios.get(
            `${this.baseUrl}/eventos.php`, {
                params: { inicio, fim }
            }
        );
        return response.data;
    }
    
    async getGraficos() {
        const response = await axios.get(`${this.baseUrl}/graficos.php`);
        return response.data;
    }
}
```

## Calendário de Eventos

### Tipos de Eventos
1. Vencimentos de Contrato
   - Cor: Amarelo
   - Ícone: 📄
   - Ação: Abre modal do contrato

2. Vencimentos de Fatura
   - Cor: Verde (em dia) / Vermelho (atrasada)
   - Ícone: 💰
   - Ação: Abre modal da fatura

3. Ordens de Serviço
   - Cor: Azul
   - Ícone: 🔧
   - Ação: Abre modal da OS

### Integração

O calendário é integrado com:
- Módulo de Contratos
- Módulo de Faturas
- Módulo de Ordens de Serviço

### Atualização

- Automática a cada 5 minutos
- Manual via botão de refresh
- Ao criar/editar eventos relacionados

## Observações Importantes

### Performance
- Lazy loading de eventos
- Cache de estatísticas
- Otimização de queries

### Segurança
- Validação de datas
- Sanitização de parâmetros
- Controle de acesso

### Manutenção
- Logs de erros
- Monitoramento de performance
- Backup de dados 
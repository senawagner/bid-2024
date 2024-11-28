# Sistema Central de Logs

Sistema unificado para gerenciamento de logs no frontend, com suporte a múltiplos módulos e níveis de log.

## Características

- Singleton pattern para instância única
- Suporte a múltiplos níveis (DEBUG, INFO, WARN, ERROR)
- Registro por módulos independentes
- Log no console com cores
- Envio para servidor
- Contexto rico (timestamp, URL, usuário)

## Uso Básico

```javascript
import { logger } from './utils/Logger.js';

// Logs simples
logger.debug('Mensagem de debug');
logger.info('Operação concluída');
logger.warn('Alerta importante');
logger.error('Erro crítico', { detalhes: 'do erro' });

// Logs com módulo
logger.info('Usuário logado', null, 'auth');
```

## Registrando Módulos

```javascript
logger.registerModule('meuModulo', {
    enabled: true,    // Ativa/desativa logs do módulo
    level: 'INFO'     // Nível mínimo de log
});
```

## Configuração

O logger pode ser configurado globalmente:

```javascript
logger.config.enabled = true;     // Ativa/desativa todos os logs
logger.config.console = true;     // Logs no console
logger.config.server = true;      // Envio para servidor
```

## Estrutura do Log

Cada entrada de log contém:

```javascript
{
    timestamp: '2024-11-15T13:17:07.000Z',
    type: 'INFO',
    message: 'Mensagem do log',
    data: null,                   // Dados adicionais (opcional)
    url: 'http://site.com/page',  // URL atual
    user: '{...}'                 // Usuário logado (se houver)
}
```

## Níveis de Log

1. DEBUG: Informações detalhadas para desenvolvimento
2. INFO: Eventos normais do sistema
3. WARN: Alertas que precisam de atenção
4. ERROR: Erros que afetam funcionalidades

## Backend

Os logs são enviados para `/api/log.php` via POST em formato JSON. 

## Estrutura de Arquivos

Os logs são organizados em diretórios específicos:

```
/logs/
  ├── system/                  # Logs do sistema
  │   ├── YYYY-MM-DD.log      # Logs gerais diários
  │   └── error.log           # Erros críticos
  │
  ├── access/                  # Logs de acesso/autenticação
  │   ├── auth.log            # Tentativas de login/logout
  │   └── api.log             # Acessos à API
  │
  ├── modules/                 # Logs específicos por módulo
  │   ├── usuarios/
  │   │   └── YYYY-MM-DD.log
  │   ├── clientes/
  │   │   └── YYYY-MM-DD.log
  │   └── ...
  │
  └── audit/                   # Logs de auditoria
      └── YYYY-MM/            # Organizados por mês
          └── DD.log          # Um arquivo por dia
```

### Tipos de Log

1. **System Logs**: Logs gerais do sistema e erros críticos
2. **Access Logs**: Registros de autenticação e acesso à API
3. **Module Logs**: Logs específicos de cada módulo do sistema
4. **Audit Logs**: Registros de auditoria (alterações importantes)

Os logs de erro (type: 'ERROR') são automaticamente duplicados em `/logs/system/error.log` para facilitar o monitoramento. 

# Utilitários do Frontend

## Sistema de Notificações (Toast)

Sistema unificado para exibição de notificações visuais temporárias usando a biblioteca toastr.

### Dependências

```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css">

<!-- JavaScript -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>
<script src="../assets/js/toast.js"></script>
```

### Uso Básico

```javascript
// Mensagem de sucesso (verde)
Toast.success('Operação realizada com sucesso!');

// Mensagem de erro (vermelha)
Toast.error('Falha ao processar requisição');

// Mensagem de aviso (amarela)
Toast.warning('Atenção: dados incompletos');

// Mensagem informativa (azul)
Toast.info('Novos dados disponíveis');
```

### Características

- Notificações não intrusivas
- Feedback visual imediato
- Diferentes cores por tipo de mensagem
- Animações suaves
- Auto-fechamento configurável
- Suporte a múltiplas mensagens
- Fechamento manual opcional

### Implementação

```javascript
const Toast = {
    success(message) {
        toastr.success(message);
    },
    error(message) {
        toastr.error(message);
    },
    warning(message) {
        toastr.warning(message);
    },
    info(message) {
        toastr.info(message);
    }
};

window.Toast = Toast;
```

### Integração com Módulos

O Toast é frequentemente usado em conjunto com outros utilitários:

```javascript
try {
    await salvarDados();
    Toast.success('Dados salvos com sucesso!');
    Logger.info('Operação de salvamento concluída');
} catch (error) {
    Toast.error('Erro ao salvar dados');
    Logger.error('Falha na operação', error);
}
```
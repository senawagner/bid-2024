-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Tempo de geração: 15/11/2024 às 07:24
-- Versão do servidor: 10.6.19-MariaDB-cll-lve
-- Versão do PHP: 8.3.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `coddarco_bid`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `razao_social` varchar(200) NOT NULL,
  `nome_fantasia` varchar(200) DEFAULT NULL,
  `cnpj` varchar(14) DEFAULT NULL,
  `inscricao_estadual` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `endereco` varchar(200) DEFAULT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `complemento` varchar(100) DEFAULT NULL,
  `bairro` varchar(100) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `estado` char(2) DEFAULT NULL,
  `cep` varchar(8) DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `documento` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `clientes`
--

INSERT INTO `clientes` (`id`, `razao_social`, `nome_fantasia`, `cnpj`, `inscricao_estadual`, `email`, `telefone`, `celular`, `endereco`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `cep`, `observacoes`, `ativo`, `criado_em`, `atualizado_em`, `deleted_at`, `documento`) VALUES
(1, 'teste', NULL, '34889330000100', '', 'iacs@iacs.com.br', '1330000000', '', 'Av. Ana Costa', '402', '', 'Gonzaga', 'Santos', 'SP', '10000000', 'teste', 1, '2024-11-14 00:19:08', '2024-11-14 00:19:08', NULL, NULL),
(2, 'TESTE', NULL, '44974822001030', '', 'iacs@iacs.com.br', '1330000000', '', 'Av. Ana Costa', '402', '', 'Gonzaga', 'Santos', 'SP', '10000000', 'TESTE', 1, '2024-11-14 00:20:58', '2024-11-14 00:20:58', NULL, NULL),
(3, 'Novo', NULL, '75878140000166', '123.445.88', 'wagnersena@hotmail.com', '1399704925', '', 'R. Maj. Santos Silva', '27', '61', 'Embaré', 'Santos', 'SP', '11025100', 'teste', 1, '2024-11-14 00:27:14', '2024-11-14 00:27:14', NULL, NULL),
(4, 'Novo2', 'CLAUDIO WAGNER SENA', '44974822000300', '123.445.99', 'wagnersena2@hotmail.com', '(13) 9970-4925', '(13) 98210-7988', 'R. Maj. Santos Silva', '27', '- 61', 'Embaré', 'Santos', '', '11025100', '', 1, '2024-11-14 01:14:54', '2024-11-14 01:14:54', NULL, NULL),
(5, 'Novo2', 'CLAUDIO WAGNER SENA', '75878140000155', '123.445.66', 'wagnersena@hotmail.com', '(13) 9811-2946', '', 'R. Maj. Santos Silva', '27', '- 61', 'Embaré', 'Santos', 'SP', '11025100', '', 1, '2024-11-14 01:22:22', '2024-11-14 01:22:22', NULL, NULL),
(6, 'Novo2', 'CLAUDIO WAGNER SENA', '07068110000134', '123.445.88', 'wagnersena3@hotmail.com', '1399704925', '', 'R. Maj. Santos Silva', '27', '- 61', 'Embaré', 'Santos', 'SP', '11025100', '', 1, '2024-11-14 01:26:57', '2024-11-14 01:26:57', NULL, NULL),
(7, 'Cliente VIP', 'Toca do Terror', '44974822001039', '123.445.03', 'vagnersena@hotmail.com', '1399704925', '13982107999', 'R. Maj. Santos Silva', '27', '- 61', 'Embaré', 'Santos', 'SP', '11025100', 'hfhjhashdjlfhfffsdds', 1, '2024-11-14 02:20:06', '2024-11-14 02:20:06', NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `contratos`
--

CREATE TABLE `contratos` (
  `id` int(11) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `numero_contrato` varchar(20) NOT NULL,
  `descricao` text DEFAULT NULL,
  `valor` decimal(10,2) NOT NULL,
  `data_inicio` date NOT NULL,
  `data_fim` date DEFAULT NULL,
  `status` enum('pendente','aprovado','rejeitado','cancelado') DEFAULT 'pendente',
  `caminho_arquivo` varchar(255) DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `criado_por` int(11) DEFAULT NULL,
  `atualizado_por` int(11) DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `faturas`
--

CREATE TABLE `faturas` (
  `id` int(11) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `contrato_id` int(11) DEFAULT NULL,
  `ordem_servico_id` int(11) DEFAULT NULL,
  `numero_fatura` varchar(20) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `data_emissao` date NOT NULL,
  `data_vencimento` date NOT NULL,
  `data_pagamento` date DEFAULT NULL,
  `status` enum('pendente','paga','cancelada','atrasada') DEFAULT 'pendente',
  `observacoes` text DEFAULT NULL,
  `criado_por` int(11) DEFAULT NULL,
  `atualizado_por` int(11) DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `login_attempts`
--

CREATE TABLE `login_attempts` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `ordens_servico`
--

CREATE TABLE `ordens_servico` (
  `id` int(11) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `contrato_id` int(11) DEFAULT NULL,
  `numero_os` varchar(20) NOT NULL,
  `descricao` text NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `data_inicio` date NOT NULL,
  `data_previsao` date DEFAULT NULL,
  `data_conclusao` date DEFAULT NULL,
  `status` enum('aberta','em_andamento','concluida','cancelada') DEFAULT 'aberta',
  `observacoes` text DEFAULT NULL,
  `criado_por` int(11) DEFAULT NULL,
  `atualizado_por` int(11) DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `data_abertura` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `nivel` enum('admin','usuario') DEFAULT 'usuario',
  `ativo` tinyint(1) DEFAULT 1,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `username`, `nome`, `email`, `senha`, `nivel`, `ativo`, `criado_em`, `atualizado_em`, `deleted_at`) VALUES
(1, 'admin', 'Administrador', 'admin@exemplo.com', '$2y$10$q.mYNGI2bSGlX8to/MqKm.UUdnEOSMqQ29vS/cxKkPgIrepS7E6jK', 'admin', 1, '2024-11-13 00:30:05', '2024-11-13 12:49:38', NULL);

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cnpj` (`cnpj`),
  ADD KEY `idx_clientes_documento` (`documento`),
  ADD KEY `idx_clientes_deleted_at` (`deleted_at`);

--
-- Índices de tabela `contratos`
--
ALTER TABLE `contratos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_contrato` (`numero_contrato`),
  ADD KEY `cliente_id` (`cliente_id`),
  ADD KEY `criado_por` (`criado_por`),
  ADD KEY `atualizado_por` (`atualizado_por`);

--
-- Índices de tabela `faturas`
--
ALTER TABLE `faturas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_fatura` (`numero_fatura`),
  ADD KEY `contrato_id` (`contrato_id`),
  ADD KEY `ordem_servico_id` (`ordem_servico_id`),
  ADD KEY `criado_por` (`criado_por`),
  ADD KEY `atualizado_por` (`atualizado_por`),
  ADD KEY `idx_faturas_data_emissao` (`data_emissao`),
  ADD KEY `idx_faturas_data_vencimento` (`data_vencimento`),
  ADD KEY `idx_faturas_status` (`status`),
  ADD KEY `idx_faturas_deleted_at` (`deleted_at`),
  ADD KEY `idx_faturas_cliente_status` (`cliente_id`,`status`),
  ADD KEY `idx_faturas_vencimento_status` (`data_vencimento`,`status`);

--
-- Índices de tabela `login_attempts`
--
ALTER TABLE `login_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Índices de tabela `ordens_servico`
--
ALTER TABLE `ordens_servico`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_os` (`numero_os`),
  ADD KEY `cliente_id` (`cliente_id`),
  ADD KEY `contrato_id` (`contrato_id`),
  ADD KEY `criado_por` (`criado_por`),
  ADD KEY `atualizado_por` (`atualizado_por`),
  ADD KEY `idx_os_status` (`status`),
  ADD KEY `idx_os_data_abertura` (`data_abertura`),
  ADD KEY `idx_os_deleted_at` (`deleted_at`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_usuarios_deleted_at` (`deleted_at`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `contratos`
--
ALTER TABLE `contratos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `faturas`
--
ALTER TABLE `faturas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `login_attempts`
--
ALTER TABLE `login_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `ordens_servico`
--
ALTER TABLE `ordens_servico`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `contratos`
--
ALTER TABLE `contratos`
  ADD CONSTRAINT `contratos_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  ADD CONSTRAINT `contratos_ibfk_2` FOREIGN KEY (`criado_por`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `contratos_ibfk_3` FOREIGN KEY (`atualizado_por`) REFERENCES `usuarios` (`id`);

--
-- Restrições para tabelas `faturas`
--
ALTER TABLE `faturas`
  ADD CONSTRAINT `faturas_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  ADD CONSTRAINT `faturas_ibfk_2` FOREIGN KEY (`contrato_id`) REFERENCES `contratos` (`id`),
  ADD CONSTRAINT `faturas_ibfk_3` FOREIGN KEY (`ordem_servico_id`) REFERENCES `ordens_servico` (`id`),
  ADD CONSTRAINT `faturas_ibfk_4` FOREIGN KEY (`criado_por`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `faturas_ibfk_5` FOREIGN KEY (`atualizado_por`) REFERENCES `usuarios` (`id`);

--
-- Restrições para tabelas `ordens_servico`
--
ALTER TABLE `ordens_servico`
  ADD CONSTRAINT `ordens_servico_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  ADD CONSTRAINT `ordens_servico_ibfk_2` FOREIGN KEY (`contrato_id`) REFERENCES `contratos` (`id`),
  ADD CONSTRAINT `ordens_servico_ibfk_3` FOREIGN KEY (`criado_por`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `ordens_servico_ibfk_4` FOREIGN KEY (`atualizado_por`) REFERENCES `usuarios` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

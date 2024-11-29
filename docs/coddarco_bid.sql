-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Tempo de geração: 28/11/2024 às 20:24
-- Versão do servidor: 10.6.19-MariaDB-cll-lve
-- Versão do PHP: 8.3.14

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
-- Estrutura para tabela `ajustes_contratuais`
--

CREATE TABLE `ajustes_contratuais` (
  `id` int(11) NOT NULL,
  `contrato_id` int(11) NOT NULL,
  `tipo_ajuste` enum('adicao','remocao') NOT NULL,
  `descricao_ajuste` text NOT NULL,
  `data_notificacao` date NOT NULL,
  `data_aprovacao` date DEFAULT NULL,
  `status` enum('pendente','aprovado','rejeitado') DEFAULT 'pendente',
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `auditorias`
--

CREATE TABLE `auditorias` (
  `id` int(11) NOT NULL,
  `contrato_id` int(11) NOT NULL,
  `data_auditoria` date NOT NULL,
  `status` enum('agendada','realizada','cancelada') DEFAULT 'agendada',
  `observacoes` text DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `tipo_cliente` enum('fisica','juridica') NOT NULL,
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

INSERT INTO `clientes` (`id`, `tipo_cliente`, `razao_social`, `nome_fantasia`, `cnpj`, `inscricao_estadual`, `email`, `telefone`, `celular`, `endereco`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `cep`, `observacoes`, `ativo`, `criado_em`, `atualizado_em`, `deleted_at`, `documento`) VALUES
(1, 'fisica', 'teste', NULL, '34889330000100', '', 'iacs@iacs.com.br', '1330000000', '', 'Av. Ana Costa', '402', '', 'Gonzaga', 'Santos', 'SP', '10000000', 'teste', 0, '2024-11-14 00:19:08', '2024-11-28 19:46:54', NULL, NULL),
(2, 'fisica', 'Refrigelo Climatização de Ambientes S.A', 'CLAUDIO WAGNER SENA', '44974822001030', '', 'iacs@iacs.com.br', '(13) 9970-4925', '', 'Rua Major Santos Silva', '27', '- 61', 'Embaré', 'Santos', 'SP', '11025-10', 'TESTE', 1, '2024-11-14 00:20:58', '2024-11-28 19:59:29', NULL, NULL),
(3, 'fisica', 'Ana Cristina Gomez Cabaleiro Torretta', 'IACS', '75878140000166', '', 'iacs@iacs.com.br', '(13) 3000-0000', '', 'Av. Ana Costa', '402', '61', 'Gonzaga', 'Santos', 'SP', '10000-00', 'teste', 1, '2024-11-14 00:27:14', '2024-11-28 20:01:46', NULL, NULL),
(4, 'fisica', 'Novo2', 'CLAUDIO WAGNER SENA', '44974822000300', '123.445.99', 'wagnersena2@hotmail.com', '(13) 9970-4925', '(13) 98210-7988', 'R. Maj. Santos Silva', '27', '- 61', 'Embaré', 'Santos', '', '11025100', '', 0, '2024-11-14 01:14:54', '2024-11-28 19:47:02', NULL, NULL),
(5, 'fisica', 'TOAST', '', '75878140000155', '', 'wagnersena@hotmail.com', '(13) 9811-2946', '', 'R. Maj. Santos Silva', '27', '- 61', 'Embaré', 'Santos', 'SP', '11025100', '', 1, '2024-11-14 01:22:22', '2024-11-28 20:02:59', NULL, NULL),
(6, 'fisica', 'AG', '', '07068110000134', '', 'wagnersena3@hotmail.com', '1399704925', '', 'R. Maj. Santos Silva', '27', '- 61', 'Embaré', 'Santos', 'SP', '11025100', '', 1, '2024-11-14 01:26:57', '2024-11-28 20:03:16', NULL, NULL),
(7, 'fisica', 'Cliente VIP', 'Toca do Terror', '44974822001039', '123.445.03', 'vagnersena@hotmail.com', '1399704925', '13982107999', 'R. Maj. Santos Silva', '27', '- 61', 'Embaré', 'Santos', 'SP', '11025100', 'hfhjhashdjlfhfffsdds', 1, '2024-11-14 02:20:06', '2024-11-14 02:20:06', NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `contratos`
--

CREATE TABLE `contratos` (
  `id` int(11) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `tipo_contrato` enum('preventiva','corretiva') NOT NULL,
  `numero_contrato` varchar(20) NOT NULL,
  `descricao` text DEFAULT NULL,
  `frequencia` enum('mensal','bimestral','trimestral','semestral','anual') DEFAULT NULL,
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
-- Estrutura para tabela `cronograma_preventiva`
--

CREATE TABLE `cronograma_preventiva` (
  `id` int(11) NOT NULL,
  `contrato_id` int(11) NOT NULL,
  `data_programada` date NOT NULL,
  `status` enum('pendente','realizada','cancelada') DEFAULT 'pendente',
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `equipamentos`
--

CREATE TABLE `equipamentos` (
  `id` int(11) NOT NULL,
  `contrato_id` int(11) NOT NULL,
  `tipo_equipamento` enum('climatizacao','refrigeracao') NOT NULL,
  `equipamento_backup` tinyint(1) DEFAULT 0,
  `fabricante` varchar(100) DEFAULT NULL,
  `modelo_condensadora` varchar(100) DEFAULT NULL,
  `modelo_evaporadora` varchar(100) DEFAULT NULL,
  `data_instalacao` date DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

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
  `desconto_aplicado` decimal(10,2) DEFAULT 0.00,
  `motivo_desconto` varchar(255) DEFAULT NULL,
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

--
-- Despejando dados para a tabela `login_attempts`
--

INSERT INTO `login_attempts` (`id`, `username`, `ip_address`, `created_at`) VALUES
(1, 'admin', '127.0.0.1', '2024-11-16 17:02:37'),
(2, 'admin', '127.0.0.1', '2024-11-16 17:13:39'),
(3, 'admin', '127.0.0.1', '2024-11-16 17:19:26'),
(4, 'admin', '127.0.0.1', '2024-11-16 17:19:46'),
(5, 'admin', '127.0.0.1', '2024-11-16 23:25:06'),
(6, 'admin', '127.0.0.1', '2024-11-17 00:38:09'),
(7, 'admin', '127.0.0.1', '2024-11-17 00:40:49'),
(8, 'admin', '127.0.0.1', '2024-11-17 00:41:22'),
(9, 'admin', '127.0.0.1', '2024-11-18 15:11:58'),
(10, 'admin', '127.0.0.1', '2024-11-18 23:37:10'),
(11, 'admin', '127.0.0.1', '2024-11-19 00:47:18'),
(12, 'admin', '127.0.0.1', '2024-11-19 07:35:24'),
(13, 'admin', '127.0.0.1', '2024-11-19 07:43:28'),
(14, 'admin', '127.0.0.1', '2024-11-19 07:55:30'),
(15, 'admin', '127.0.0.1', '2024-11-19 07:55:35'),
(16, 'admin', '127.0.0.1', '2024-11-19 07:56:16'),
(17, 'admin', '127.0.0.1', '2024-11-19 08:21:09'),
(18, 'admin', '127.0.0.1', '2024-11-19 08:21:17'),
(19, 'admin', '127.0.0.1', '2024-11-27 16:12:13'),
(20, 'admin', '127.0.0.1', '2024-11-27 16:12:26'),
(21, 'admin', '127.0.0.1', '2024-11-27 16:20:19'),
(22, 'admin', '127.0.0.1', '2024-11-27 16:25:17'),
(23, 'admin', '127.0.0.1', '2024-11-27 16:25:22'),
(24, 'admin', '127.0.0.1', '2024-11-27 16:25:35'),
(25, 'admin', '127.0.0.1', '2024-11-27 16:26:08'),
(26, 'admin', '127.0.0.1', '2024-11-27 16:31:09'),
(27, 'admin', '127.0.0.1', '2024-11-27 16:31:14'),
(28, 'admin', '127.0.0.1', '2024-11-27 16:40:19'),
(29, 'admin', '127.0.0.1', '2024-11-27 16:49:18'),
(30, 'admin', '127.0.0.1', '2024-11-27 16:50:42'),
(31, 'admin', '127.0.0.1', '2024-11-27 16:57:37'),
(32, 'admin', '127.0.0.1', '2024-11-27 17:23:08'),
(33, 'admin', '127.0.0.1', '2024-11-27 17:25:07'),
(34, 'admin', '127.0.0.1', '2024-11-27 17:26:41'),
(35, 'admin', '127.0.0.1', '2024-11-27 17:26:53'),
(36, 'admin', '127.0.0.1', '2024-11-27 17:27:15'),
(37, 'admin', '127.0.0.1', '2024-11-27 17:29:58'),
(38, 'admin', '127.0.0.1', '2024-11-27 17:43:17'),
(39, 'admin', '127.0.0.1', '2024-11-27 17:48:16'),
(40, 'admin', '127.0.0.1', '2024-11-27 17:48:19'),
(41, 'admin', '127.0.0.1', '2024-11-27 17:50:52'),
(42, 'admin', '127.0.0.1', '2024-11-27 17:50:57'),
(43, 'admin', '127.0.0.1', '2024-11-27 17:51:27'),
(44, 'admin', '127.0.0.1', '2024-11-27 17:54:48'),
(45, 'admin', '127.0.0.1', '2024-11-27 17:57:21'),
(46, 'admin', '127.0.0.1', '2024-11-27 17:57:26'),
(47, 'admin', '127.0.0.1', '2024-11-27 17:58:52'),
(48, 'admin', '127.0.0.1', '2024-11-27 19:40:29'),
(49, 'admin', '127.0.0.1', '2024-11-27 19:42:12'),
(50, 'admin', '127.0.0.1', '2024-11-27 19:46:51'),
(51, 'admin', '127.0.0.1', '2024-11-27 19:47:26'),
(52, 'admin', '127.0.0.1', '2024-11-27 19:47:36'),
(53, 'admin', '127.0.0.1', '2024-11-27 19:47:47'),
(54, 'admin', '127.0.0.1', '2024-11-27 19:54:08'),
(55, 'admin', '127.0.0.1', '2024-11-27 20:33:53'),
(56, 'admin', '127.0.0.1', '2024-11-27 21:59:48'),
(57, 'admin', '127.0.0.1', '2024-11-28 00:08:06'),
(58, 'admin', '127.0.0.1', '2024-11-28 00:08:23'),
(59, 'admin', '127.0.0.1', '2024-11-28 00:09:23'),
(60, 'admin', '127.0.0.1', '2024-11-28 00:09:34'),
(61, 'admin', '127.0.0.1', '2024-11-28 00:12:16'),
(62, 'admin', '127.0.0.1', '2024-11-28 01:09:27'),
(63, 'admin', '127.0.0.1', '2024-11-28 01:17:26'),
(64, 'admin', '127.0.0.1', '2024-11-28 01:25:25'),
(65, 'admin', '127.0.0.1', '2024-11-28 01:34:24'),
(66, 'admin', '127.0.0.1', '2024-11-28 08:38:50'),
(67, 'admin', '127.0.0.1', '2024-11-28 15:46:04'),
(68, 'admin', '127.0.0.1', '2024-11-28 16:46:43'),
(69, 'admin', '127.0.0.1', '2024-11-28 18:51:43');

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
(1, 'admin', 'Administrador', 'admin@exemplo.com', '$2y$10$bUteMOe1VhcwsjOHszFLie9Kx5rZiE.gKcx.GLlruQMdpq8uXye6.', 'admin', 1, '2024-11-13 00:30:05', '2024-11-16 18:50:46', NULL),
(3, 'wagner.sena', 'Wagner Sena2', 'wagnersena@hotmail.com', '$2y$10$uCNfUBwXPqCowmRf.r2vserl0TAb2R.XI5gEooVjffjn4BL5FuLUq', 'admin', 1, '2024-11-28 01:29:09', '2024-11-28 20:04:16', NULL);

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `ajustes_contratuais`
--
ALTER TABLE `ajustes_contratuais`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contrato_id` (`contrato_id`);

--
-- Índices de tabela `auditorias`
--
ALTER TABLE `auditorias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contrato_id` (`contrato_id`);

--
-- Índices de tabela `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cnpj` (`cnpj`),
  ADD KEY `idx_clientes_documento` (`documento`),
  ADD KEY `idx_clientes_deleted_at` (`deleted_at`),
  ADD KEY `idx_deleted_at` (`deleted_at`);

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
-- Índices de tabela `cronograma_preventiva`
--
ALTER TABLE `cronograma_preventiva`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contrato_id` (`contrato_id`);

--
-- Índices de tabela `equipamentos`
--
ALTER TABLE `equipamentos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contrato_id` (`contrato_id`);

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
-- AUTO_INCREMENT de tabela `ajustes_contratuais`
--
ALTER TABLE `ajustes_contratuais`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `auditorias`
--
ALTER TABLE `auditorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT de tabela `cronograma_preventiva`
--
ALTER TABLE `cronograma_preventiva`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `equipamentos`
--
ALTER TABLE `equipamentos`
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT de tabela `ordens_servico`
--
ALTER TABLE `ordens_servico`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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

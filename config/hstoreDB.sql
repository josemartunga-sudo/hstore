CREATE schema IF NOT EXISTS `hstore` DEFAULT CHARACTER SET utf8 ;
USE `hstore` ;

CREATE TABLE IF NOT EXISTS `hstore`.`usuarios` (
  `id_usuario` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(45) NOT NULL,
  `telefone` VARCHAR(45) NOT NULL UNIQUE,
  `email` VARCHAR(45) NOT NULL UNIQUE,
  `tipo` ENUM('Admin', 'Normal', 'Root') NOT NULL default 'Normal',
  `senha` TEXT NOT NULL ,
  `data_criacao` datetime NOT NULL default current_timestamp,
  `ultima_actualizacao` datetime NOT NULL default current_timestamp,
  `estado` ENUM('Ativo', 'Inativo')  NOT NULL  default 'Ativo'
) 
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `hstore`.`agentes` (
  `id_agente` INT NOT NULL PRIMARY KEY,
  `telefone` INT NOT NULL unique,
  `nome` VARCHAR(45) NOT NULL,
  `data_criacao` DATETIME NOT NULL default current_timestamp,
  `estado` ENUM('Ativo', 'Inativo') NOT NULL  default 'Ativo',
  `ultima_actualizacao` DATETIME NOT NULL default current_timestamp,
  `usuario_id` INT NOT NULL,
  foreign key(`usuario_id`) references  `hstore`.`usuarios` (`id_usuario`)
  ON DELETE CASCADE
)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `hstore`.`faturacoes` (
  `id_facturacao` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `valor` double   not NULL,
  `data_faturacao` datetime NOT NULL default current_timestamp,
  `ultima_actualizacao` datetime NOT NULL default current_timestamp,
  `estado` ENUM('Pendente', 'Pago') not NULL default 'Pago',
  `tipo_faturacao` ENUM('Físico', 'Electrônico') not NULL,
  `forma_pagamento` ENUM('Quinzenal', 'Mensal') not NULL default 'Mensal',
  `agente_id` INT NOT NULL,
  foreign key(`agente_id`) references  `hstore`.`agentes` (`id_agente`)
  ON DELETE CASCADE,
  `usuario_id` INT NOT NULL,
  foreign key(`usuario_id`) references  `hstore`.`usuarios` (`id_usuario`)
  ON DELETE CASCADE
)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `hstore`.`pagamentos` (
  `id_pagamento` INT NOT NULL auto_increment PRIMARY KEY,
  `data_pagamento` datetime NOT NULL default current_timestamp,
  `data_correspondente` DATETIME NOT NULL,
  `parcela` ENUM('Primeira', 'Segunda', 'Única') not NULL default 'Única',
  `bonus` double NOT NULL,
  `resto` double NOT NULL default 0.0,
  `agente_id` INT NOT NULL,
  `usuario_id` INT NOT NULL,
  foreign key(`agente_id`) references  `hstore`.`agentes` (`id_agente`)
  ON DELETE CASCADE,
  foreign key(`usuario_id`) references  `hstore`.`usuarios` (`id_usuario`)
  ON DELETE CASCADE
) ENGINE = InnoDB;

insert into usuarios values(default, "Hermenegildo Sebastiao", "942199012", "hermenegildo@gmail.com", "Admin", "$2b$10$6lXlP79Zp9MWqgvP.wO7HOuNjF8eJghyf.7wVTq8aiIXrvi8yU0YS", default, default, default);

insert into usuarios values(default, "Altino Sebastiao", "937413018", "altino@gmail.com", "Admin", "$2b$10$g2PNOqQhE.DBDTGw2oHwseF1V8GZLr7WsW6VS/0I7YcoaS9BtEG.S", default, default, default);
CREATE DATABASE "market_cubos";

DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  nome_loja VARCHAR(50) NOT NULL,
  email VARCHAR NOT NULL,
  senha TEXT NOT NULL  
);

DROP TABLE IF EXISTS produtos;
CREATE TABLE produtos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  nome VARCHAR(50) NOT NULL,
  estoque INTEGER NOT NULL,
  categoria VARCHAR(50),
  preco INTEGER NOT NULL,
  descricao TEXT NOT NULL,
  imagem TEXT
);
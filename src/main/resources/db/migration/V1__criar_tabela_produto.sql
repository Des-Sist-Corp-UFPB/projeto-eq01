-- Migração V1: Criação da tabela de produtos
-- O Flyway executa este script automaticamente na inicialização da aplicação
-- Convenção de nomenclatura: V{número}__{descrição}.sql
--
-- O Flyway registra cada migração executada na tabela flyway_schema_history.
-- Uma vez executada, uma migração NÃO pode ser modificada (o Flyway verifica o checksum).
-- Para alterar a estrutura, crie uma nova migração: V2__adicionar_coluna_xyz.sql

CREATE TABLE produto (
    id            BIGSERIAL PRIMARY KEY,
    nome          VARCHAR(120)             NOT NULL,
    descricao     TEXT,
    preco         NUMERIC(10, 2)           NOT NULL CHECK (preco >= 0),
    criado_em     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índice para busca por nome (case-insensitive via ILIKE no PostgreSQL)
-- Melhora a performance da query: WHERE LOWER(nome) LIKE LOWER('%termo%')
CREATE INDEX idx_produto_nome ON produto (nome);

COMMENT ON TABLE produto IS 'Tabela de produtos do sistema';
COMMENT ON COLUMN produto.preco IS 'Preço em reais, com 2 casas decimais';
COMMENT ON COLUMN produto.criado_em IS 'Timestamp de criação do registro (UTC)';
COMMENT ON COLUMN produto.atualizado_em IS 'Timestamp da última atualização do registro (UTC)';

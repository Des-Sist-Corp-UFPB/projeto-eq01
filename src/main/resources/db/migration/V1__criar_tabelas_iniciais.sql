CREATE TABLE usuario (
    id            BIGSERIAL PRIMARY KEY,
    nome          VARCHAR(120)             NOT NULL,
    username      VARCHAR(60)              NOT NULL UNIQUE,
    email         VARCHAR(160)             NOT NULL UNIQUE,
    senha         VARCHAR(255)             NOT NULL,
    papel         VARCHAR(30)              NOT NULL DEFAULT 'USER',
    ativo         BOOLEAN                  NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usuario_username ON usuario (username);
CREATE INDEX idx_usuario_email ON usuario (email);

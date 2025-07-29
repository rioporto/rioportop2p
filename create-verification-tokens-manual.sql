-- Script para criar tabela verification_tokens manualmente
-- Execute este SQL diretamente no Neon Console

-- 1. Criar tabela
CREATE TABLE IF NOT EXISTS verification_tokens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL DEFAULT 'EMAIL_VERIFICATION',
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Criar índices
CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires_at ON verification_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_type ON verification_tokens(type);

-- 3. Adicionar foreign key (se a tabela users existir)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE verification_tokens 
        ADD CONSTRAINT fk_verification_tokens_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Verificar se foi criada
SELECT 'Tabela criada com sucesso!' as status, COUNT(*) as total_registros FROM verification_tokens;
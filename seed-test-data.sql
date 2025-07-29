-- Script para popular banco com dados de teste
-- ATENÇÃO: Execute apenas em ambiente de desenvolvimento!

-- 1. Criar usuários de teste com diferentes níveis KYC
INSERT INTO users (id, email, email_verified, password_hash, first_name, last_name, kyc_level, cpf, phone, created_at)
VALUES 
  -- Senha para todos: Test123!
  ('test-user-1', 'vendedor1@test.com', true, '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNOFWC', 'João', 'Vendedor', 'ADVANCED', '11144477735', '11987654321', NOW() - INTERVAL '30 days'),
  ('test-user-2', 'vendedor2@test.com', true, '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNOFWC', 'Maria', 'Silva', 'INTERMEDIATE', '22255588846', '21998765432', NOW() - INTERVAL '20 days'),
  ('test-user-3', 'comprador1@test.com', true, '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNOFWC', 'Pedro', 'Comprador', 'BASIC', '33366699957', '31976543210', NOW() - INTERVAL '10 days')
ON CONFLICT (email) DO NOTHING;

-- 2. Criar métodos de pagamento
INSERT INTO payment_methods (id, user_id, type, name, details, is_active, created_at)
VALUES
  ('pm-1', 'test-user-1', 'PIX', 'PIX João', '{"key": "11987654321", "keyType": "PHONE"}', true, NOW()),
  ('pm-2', 'test-user-1', 'BANK_TRANSFER', 'Banco do Brasil', '{"bank": "001", "agency": "1234", "account": "56789-0"}', true, NOW()),
  ('pm-3', 'test-user-2', 'PIX', 'PIX Maria', '{"key": "maria@test.com", "keyType": "EMAIL"}', true, NOW()),
  ('pm-4', 'test-user-3', 'PIX', 'PIX Pedro', '{"key": "33366699957", "keyType": "CPF"}', true, NOW())
ON CONFLICT DO NOTHING;

-- 3. Criar anúncios P2P de teste
INSERT INTO p2p_ads (id, user_id, ad_type, currency, fiat_currency, price_type, fixed_price, min_amount, max_amount, available_amount, payment_methods, terms, status, created_at)
VALUES
  -- Anúncios de VENDA (vendedor tem crypto para vender)
  ('ad-sell-1', 'test-user-1', 'SELL', 'BTC', 'BRL', 'FIXED', 350000.00, 100.00, 5000.00, 0.05, '["PIX", "BANK_TRANSFER"]', 'Pagamento em até 15 minutos. Liberação imediata após confirmação.', 'ACTIVE', NOW() - INTERVAL '5 days'),
  ('ad-sell-2', 'test-user-2', 'SELL', 'USDT', 'BRL', 'FIXED', 6.20, 50.00, 2000.00, 500.00, '["PIX"]', 'Apenas PIX. Resposta rápida!', 'ACTIVE', NOW() - INTERVAL '3 days'),
  
  -- Anúncios de COMPRA (comprador quer comprar crypto)
  ('ad-buy-1', 'test-user-3', 'BUY', 'BTC', 'BRL', 'FIXED', 348000.00, 200.00, 10000.00, 0.10, '["PIX"]', 'Compro BTC, pago na hora via PIX.', 'ACTIVE', NOW() - INTERVAL '2 days'),
  ('ad-buy-2', 'test-user-1', 'BUY', 'ETH', 'BRL', 'FIXED', 18500.00, 500.00, 20000.00, 2.00, '["PIX", "BANK_TRANSFER"]', 'Comprador verificado nível 3. Pagamento garantido.', 'ACTIVE', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- 4. Criar algumas trades concluídas para histórico
INSERT INTO p2p_trades (id, ad_id, buyer_id, seller_id, crypto_amount, fiat_amount, price, fee_amount, payment_method, status, created_at, completed_at)
VALUES
  ('trade-1', 'ad-sell-1', 'test-user-3', 'test-user-1', 0.001, 350.00, 350000.00, 0.000001, '{"type": "PIX", "details": {"key": "33366699957"}}', 'COMPLETED', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '30 minutes'),
  ('trade-2', 'ad-sell-2', 'test-user-3', 'test-user-2', 100.00, 620.00, 6.20, 1.00, '{"type": "PIX", "details": {"key": "33366699957"}}', 'COMPLETED', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '15 minutes'),
  ('trade-3', 'ad-buy-1', 'test-user-3', 'test-user-1', 0.0005, 174.00, 348000.00, 0.000001, '{"type": "PIX", "details": {"key": "11987654321"}}', 'COMPLETED', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '20 minutes')
ON CONFLICT DO NOTHING;

-- 5. Criar carteiras para os usuários
INSERT INTO wallets (id, user_id, currency, type, status, created_at)
VALUES
  ('wallet-1-btc', 'test-user-1', 'BTC', 'HOT', 'ACTIVE', NOW()),
  ('wallet-1-usdt', 'test-user-1', 'USDT', 'HOT', 'ACTIVE', NOW()),
  ('wallet-1-eth', 'test-user-1', 'ETH', 'HOT', 'ACTIVE', NOW()),
  ('wallet-2-btc', 'test-user-2', 'BTC', 'HOT', 'ACTIVE', NOW()),
  ('wallet-2-usdt', 'test-user-2', 'USDT', 'HOT', 'ACTIVE', NOW()),
  ('wallet-3-btc', 'test-user-3', 'BTC', 'HOT', 'ACTIVE', NOW()),
  ('wallet-3-eth', 'test-user-3', 'ETH', 'HOT', 'ACTIVE', NOW())
ON CONFLICT DO NOTHING;

-- 6. Adicionar saldos nas carteiras
INSERT INTO wallet_balances (id, wallet_id, available_balance, locked_balance, total_balance, updated_at)
VALUES
  ('balance-1-btc', 'wallet-1-btc', 0.05, 0.00, 0.05, NOW()),
  ('balance-1-usdt', 'wallet-1-usdt', 500.00, 0.00, 500.00, NOW()),
  ('balance-1-eth', 'wallet-1-eth', 2.00, 0.00, 2.00, NOW()),
  ('balance-2-btc', 'wallet-2-btc', 0.02, 0.00, 0.02, NOW()),
  ('balance-2-usdt', 'wallet-2-usdt', 1000.00, 500.00, 1500.00, NOW()),
  ('balance-3-btc', 'wallet-3-btc', 0.0015, 0.00, 0.0015, NOW()),
  ('balance-3-eth', 'wallet-3-eth', 0.10, 0.00, 0.10, NOW())
ON CONFLICT DO NOTHING;

-- 7. Verificar dados inseridos
SELECT 'Usuários criados:' as info, COUNT(*) as total FROM users WHERE email LIKE '%test.com';
SELECT 'Anúncios P2P ativos:' as info, COUNT(*) as total FROM p2p_ads WHERE status = 'ACTIVE';
SELECT 'Trades concluídas:' as info, COUNT(*) as total FROM p2p_trades WHERE status = 'COMPLETED';
SELECT 'Carteiras ativas:' as info, COUNT(*) as total FROM wallets WHERE status = 'ACTIVE';
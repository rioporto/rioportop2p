import { PrismaClient } from '@prisma/client'

async function testConnection() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔄 Testando conexão com Neon...')
    
    // Teste 1: Verificar conexão
    await prisma.$connect()
    console.log('✅ Conectado ao banco de dados!')
    
    // Teste 2: Contar usuários
    const userCount = await prisma.user.count()
    console.log(`📊 Total de usuários: ${userCount}`)
    
    // Teste 3: Verificar tabelas
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
    ` as any[]
    
    console.log('📋 Tabelas no banco:')
    tables.forEach((table: any) => {
      console.log(`   - ${table.tablename}`)
    })
    
    console.log('\n✅ Todos os testes passaram! Banco configurado corretamente.')
    
  } catch (error) {
    console.error('❌ Erro ao conectar:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
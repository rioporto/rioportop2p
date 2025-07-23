import { prisma } from './prisma';

async function testConnection() {
  try {
    // Testa a conexão
    await prisma.$connect();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    
    // Conta usuários
    const userCount = await prisma.user.count();
    console.log(`📊 Total de usuários no banco: ${userCount}`);
    
    // Lista níveis de KYC
    const kycStats = await prisma.user.groupBy({
      by: ['kycLevel'],
      _count: {
        kycLevel: true,
      },
    });
    
    console.log('\n📈 Estatísticas de KYC:');
    kycStats.forEach(stat => {
      console.log(`   ${stat.kycLevel}: ${stat._count.kycLevel} usuários`);
    });
    
    // Desconecta
    await prisma.$disconnect();
    console.log('\n✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Execute apenas se chamado diretamente
if (require.main === module) {
  testConnection();
}

export { testConnection };
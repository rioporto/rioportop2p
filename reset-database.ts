import { PrismaClient } from '@prisma/client'

async function resetDatabase() {
  const prisma = new PrismaClient()
  
  try {
    console.log('⚠️  ATENÇÃO: Isso vai APAGAR todos os dados!')
    console.log('Aguardando 5 segundos... (Ctrl+C para cancelar)')
    
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    console.log('🗑️  Apagando todos os dados...')
    
    // Deletar na ordem correta (respeitando foreign keys)
    await prisma.systemEvent.deleteMany()
    await prisma.auditLog.deleteMany()
    await prisma.operationalLimits.deleteMany()
    await prisma.taxReport.deleteMany()
    await prisma.amlMonitoring.deleteMany()
    await prisma.bankReconciliation.deleteMany()
    await prisma.pixTransaction.deleteMany()
    await prisma.paymentMethod.deleteMany()
    await prisma.p2PTrade.deleteMany()
    await prisma.p2PAd.deleteMany()
    await prisma.trade.deleteMany()
    await prisma.order.deleteMany()
    await prisma.tradingPair.deleteMany()
    await prisma.withdrawalWhitelist.deleteMany()
    await prisma.depositAddress.deleteMany()
    await prisma.blockchainTransaction.deleteMany()
    await prisma.walletBalance.deleteMany()
    await prisma.wallet.deleteMany()
    await prisma.userSession.deleteMany()
    await prisma.userDevice.deleteMany()
    await prisma.userDocument.deleteMany()
    await prisma.userProfile.deleteMany()
    await prisma.user.deleteMany()
    
    console.log('✅ Todos os dados foram apagados!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetDatabase()
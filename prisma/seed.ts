import { PrismaClient, KYCLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpa o banco de dados
  await prisma.user.deleteMany();
  
  console.log('✅ Banco de dados limpo');

  // Senha padrão para todos os usuários de teste
  const hashedPassword = await bcrypt.hash('senha123', 10);
  const now = new Date();

  // Criar usuários de teste com diferentes níveis de KYC
  const users = await Promise.all([
    // Usuário Nível 0 - Acesso Básico
    prisma.user.create({
      data: {
        email: 'acesso@rioporto.com',
        emailVerified: true,
        emailVerifiedAt: now,
        passwordHash: hashedPassword,
        cpf: '00000000000',
        firstName: 'João',
        lastName: 'Acesso',
        birthDate: new Date('1990-01-01'),
        kycLevel: KYCLevel.PLATFORM_ACCESS,
        termsAcceptedAt: now,
        privacyAcceptedAt: now,
      }
    }),

    // Usuário Nível 1 - KYC Básico
    prisma.user.create({
      data: {
        email: 'basico@rioporto.com',
        emailVerified: true,
        emailVerifiedAt: now,
        passwordHash: hashedPassword,
        cpf: '12345678900',
        cpfVerified: true,
        cpfVerifiedAt: now,
        firstName: 'Maria',
        lastName: 'Silva',
        birthDate: new Date('1985-05-15'),
        kycLevel: KYCLevel.BASIC,
        kycApprovedAt: now,
        termsAcceptedAt: now,
        privacyAcceptedAt: now,
      }
    }),

    // Usuário Nível 2 - KYC Intermediário
    prisma.user.create({
      data: {
        email: 'intermediario@rioporto.com',
        emailVerified: true,
        emailVerifiedAt: now,
        passwordHash: hashedPassword,
        cpf: '98765432100',
        cpfVerified: true,
        cpfVerifiedAt: now,
        phone: '+5511999999999',
        phoneVerified: true,
        phoneVerifiedAt: now,
        firstName: 'Carlos',
        lastName: 'Santos',
        birthDate: new Date('1990-01-01'),
        kycLevel: KYCLevel.INTERMEDIATE,
        kycApprovedAt: now,
        termsAcceptedAt: now,
        privacyAcceptedAt: now,
      }
    }),

    // Usuário Nível 3 - KYC Avançado
    prisma.user.create({
      data: {
        email: 'avancado@rioporto.com',
        emailVerified: true,
        emailVerifiedAt: now,
        passwordHash: hashedPassword,
        cpf: '11122233344',
        cpfVerified: true,
        cpfVerifiedAt: now,
        phone: '+5521988888888',
        phoneVerified: true,
        phoneVerifiedAt: now,
        firstName: 'Ana',
        lastName: 'Oliveira',
        birthDate: new Date('1985-05-15'),
        kycLevel: KYCLevel.ADVANCED,
        kycApprovedAt: now,
        termsAcceptedAt: now,
        privacyAcceptedAt: now,
      }
    }),
  ]);

  console.log('✅ Usuários criados');

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📧 Usuários de teste:');
  console.log('- acesso@rioporto.com (Nível 0) - Senha: senha123');
  console.log('- basico@rioporto.com (Nível 1) - Senha: senha123');
  console.log('- intermediario@rioporto.com (Nível 2) - Senha: senha123');
  console.log('- avancado@rioporto.com (Nível 3) - Senha: senha123');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
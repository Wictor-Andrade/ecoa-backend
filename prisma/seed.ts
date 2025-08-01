import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@prefeitura.com' },
    update: {},
    create: {
      name: 'Admin da Prefeitura',
      email: 'admin@prefeitura.com',
      googleId: 'admin-google-id',
      isAdmin: true,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'joao@gmail.com' },
    update: {},
    create: {
      name: 'João da Silva',
      email: 'joao@gmail.com',
      googleId: 'joao-google-id',
      isAdmin: false,
    },
  });

  const complaint1 = await prisma.complaint.create({
    data: {
      title: 'Luz queimada na rua',
      description: 'O poste da Rua A está sem luz faz 3 dias.',
      category: 'ILUMINACAO',
      location: 'Rua A, Centro',
      userId: user.id,
      status: 'PENDING',
    },
  });

  const complaint2 = await prisma.complaint.create({
    data: {
      title: 'Buraco enorme',
      description: 'Tem um buraco perigoso na esquina da Rua B.',
      category: 'BURACO',
      location: 'Rua B com Rua C',
      userId: user.id,
      status: 'IN_PROGRESS',
    },
  });

  await prisma.complaint.create({
    data: {
      title: 'Lixo acumulado',
      description: 'O caminhão de lixo não passa há 1 semana.',
      category: 'LIXO',
      location: 'Rua D',
      userId: user.id,
      status: 'RESOLVED',
    },
  });

  await prisma.response.create({
    data: {
      message: 'A equipe já está indo ao local.',
      complaintId: complaint2.id,
      userId: admin.id,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      upvoted: {
        connect: [{ id: complaint1.id }, { id: complaint2.id }],
      },
    },
  });

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })

  .finally(() => prisma.$disconnect());

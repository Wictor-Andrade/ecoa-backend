import * as argon2 from 'argon2';
import { PrismaClient } from '@generated/prisma/client';
import {
  ComplaintCategory,
  ComplaintStatus,
  UserCityRole,
  UserRole,
} from '@generated/prisma/enums';

const prisma = new PrismaClient();

export async function main() {
  const carambei = await prisma.city.upsert({
    where: { name: 'Carambeí' },
    update: {},
    create: {
      name: 'Carambeí',
      state: 'Paraná',
    },
  });

  const passwordHash = await argon2.hash('12345678');

  await prisma.user.upsert({
    where: { email: 'admin@ecoa.com' },
    update: {},
    create: {
      displayName: 'Admin',
      firstName: 'Admin',
      lastName: 'Ecoa',
      email: 'admin@ecoa.com',
      googleId: 'admin-google-id',
      password: passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@prefeitura.com' },
    update: {},
    create: {
      displayName: 'Admin Carambeí',
      firstName: 'Admin',
      lastName: 'Carambeí',
      email: 'admin@carambei.com',
      googleId: 'admin-carambei-google-id',
      password: passwordHash,
      cities: {
        create: { cityId: carambei.id, role: UserCityRole.ADMIN },
      },
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'joao@gmail.com' },
    update: {},
    create: {
      displayName: 'João da Silva',
      firstName: 'João',
      lastName: 'da Silva',
      email: 'joao@gmail.com',
      googleId: 'joao-google-id',
      password: passwordHash,
      cities: {
        create: { cityId: carambei.id, role: UserCityRole.CITIZEN },
      },
    },
  });

  const complaint1 = await prisma.complaint.create({
    data: {
      title: 'Luz queimada na rua',
      description: 'O poste da Rua A está sem luz faz 3 dias.',
      category: ComplaintCategory.ILUMINACAO,
      location: 'Rua A, Centro',
      userId: user.id,
      status: ComplaintStatus.PENDING,
      cityId: carambei.id,
    },
  });

  const complaint2 = await prisma.complaint.create({
    data: {
      title: 'Buraco enorme',
      description: 'Tem um buraco perigoso na esquina da Rua B.',
      category: ComplaintCategory.BURACO,
      location: 'Rua B com Rua C',
      userId: user.id,
      status: ComplaintStatus.IN_PROGRESS,
      cityId: carambei.id,
    },
  });

  await prisma.complaint.create({
    data: {
      title: 'Lixo acumulado',
      description: 'O caminhão de lixo não passa há 1 semana.',
      category: ComplaintCategory.LIXO,
      location: 'Rua D',
      userId: user.id,
      status: ComplaintStatus.RESOLVED,
      cityId: carambei.id,
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
  .finally(() => {
    prisma.$disconnect();
  });

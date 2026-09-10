import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app.module';
import { Role } from 'src/roles/entities/role.entity';
import { UserRolesService } from 'src/user-roles/user-roles.service';
import { UsersService } from 'src/users/users.service';
import { roles } from './seed-data';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const configService = app.get(ConfigService);
    const dataSource = app.get(DataSource);
    const usersService = app.get(UsersService);
    const userRolesService = app.get(UserRolesService);
    const rolesRepository = dataSource.getRepository(Role);

    await rolesRepository.upsert(roles, ['id']);

    const superAdminRole = await rolesRepository.findOneByOrFail({
      code: 'SUPER_ADMIN',
    });
    const email = configService.getOrThrow<string>('SEED_SUPER_ADMIN_EMAIL');
    let superAdmin = await usersService.findByEmail(email);

    if (!superAdmin) {
      superAdmin = await dataSource.transaction(async (manager) => {
        const user = await usersService.create(
          {
            email,
            password: configService.getOrThrow<string>(
              'SEED_SUPER_ADMIN_PASSWORD',
            ),
            displayName: configService.getOrThrow<string>(
              'SEED_SUPER_ADMIN_DISPLAYNAME',
            ),
            address: configService.getOrThrow<string>(
              'SEED_SUPER_ADMIN_ADDRESS',
            ),
          },
          manager,
        );
        await userRolesService.assign(
          { userId: user.id, roleId: superAdminRole.id },
          manager,
        );
        return user;
      });
    } else {
      const existingSuperAdmin = superAdmin;
      const assignedRoles = await userRolesService.findByUserId(superAdmin.id);
      if (!assignedRoles.some(({ roleId }) => roleId === superAdminRole.id)) {
        await dataSource.transaction(async (manager) => {
          await userRolesService.assign(
            {
              userId: existingSuperAdmin.id,
              roleId: superAdminRole.id,
            },
            manager,
          );
        });
      }
    }

    console.log('Database seed complete.');
  } finally {
    await app.close();
  }
}

void seed().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

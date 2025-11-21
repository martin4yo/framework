import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // 1. Crear Tenant principal
  console.log('📦 Creando tenant principal...');
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'axioma' },
    update: {},
    create: {
      name: 'Axioma Core',
      slug: 'axioma',
      settings: {},
      isActive: true,
    },
  });
  console.log(`✅ Tenant creado: ${tenant.name} (${tenant.id})`);

  // 2. Crear permisos del sistema
  console.log('🔐 Creando permisos del sistema...');
  const permissions = await Promise.all([
    // Users
    prisma.permission.upsert({
      where: {
        tenantId_resource_action: {
          tenantId: tenant.id,
          resource: 'users',
          action: 'create'
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        resource: 'users',
        action: 'create',
        description: 'Crear usuarios',
      },
    }),
    prisma.permission.upsert({
      where: {
        tenantId_resource_action: {
          tenantId: tenant.id,
          resource: 'users',
          action: 'read'
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        resource: 'users',
        action: 'read',
        description: 'Leer usuarios',
      },
    }),
    prisma.permission.upsert({
      where: {
        tenantId_resource_action: {
          tenantId: tenant.id,
          resource: 'users',
          action: 'update'
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        resource: 'users',
        action: 'update',
        description: 'Actualizar usuarios',
      },
    }),
    prisma.permission.upsert({
      where: {
        tenantId_resource_action: {
          tenantId: tenant.id,
          resource: 'users',
          action: 'delete'
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        resource: 'users',
        action: 'delete',
        description: 'Eliminar usuarios',
      },
    }),
    // Roles
    prisma.permission.upsert({
      where: {
        tenantId_resource_action: {
          tenantId: tenant.id,
          resource: 'roles',
          action: 'manage'
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        resource: 'roles',
        action: 'manage',
        description: 'Gestionar roles',
      },
    }),
    // Permissions
    prisma.permission.upsert({
      where: {
        tenantId_resource_action: {
          tenantId: tenant.id,
          resource: 'permissions',
          action: 'manage'
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        resource: 'permissions',
        action: 'manage',
        description: 'Gestionar permisos',
      },
    }),
    // Tenants
    prisma.permission.upsert({
      where: {
        tenantId_resource_action: {
          tenantId: tenant.id,
          resource: 'tenants',
          action: 'manage'
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        resource: 'tenants',
        action: 'manage',
        description: 'Gestionar tenants',
      },
    }),
    // All (superadmin)
    prisma.permission.upsert({
      where: {
        tenantId_resource_action: {
          tenantId: tenant.id,
          resource: '*',
          action: '*'
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        resource: '*',
        action: '*',
        description: 'Acceso total al sistema',
      },
    }),
  ]);
  console.log(`✅ ${permissions.length} permisos creados`);

  // 3. Crear rol SuperAdmin
  console.log('👑 Creando rol SuperAdmin...');
  const superAdminRole = await prisma.role.upsert({
    where: {
      tenantId_name: {
        tenantId: tenant.id,
        name: 'SuperAdmin',
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'SuperAdmin',
      description: 'Administrador con acceso total al sistema',
      isSystem: true,
    },
  });
  console.log(`✅ Rol creado: ${superAdminRole.name}`);

  // 4. Asignar todos los permisos al rol SuperAdmin
  console.log('🔗 Asignando permisos al rol SuperAdmin...');
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }
  console.log(`✅ ${permissions.length} permisos asignados al rol SuperAdmin`);

  // 5. Crear usuario admin
  console.log('👤 Creando usuario admin...');
  const passwordHash = await bcrypt.hash('admin123', 10);

  // Buscar si ya existe
  let adminUser = await prisma.user.findFirst({
    where: {
      email: 'admin@axioma.com',
      tenantId: tenant.id,
    },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: 'admin@axioma.com',
        passwordHash,
        firstName: 'Super',
        lastName: 'Admin',
        isActive: true,
        emailVerified: true,
      },
    });
    console.log(`✅ Usuario creado: ${adminUser.email} (${adminUser.id})`);
  } else {
    console.log(`ℹ️  Usuario ya existe: ${adminUser.email} (${adminUser.id})`);
  }

  // 6. Crear relación user_tenant
  console.log('🔗 Asignando usuario al tenant...');
  const existingUserTenant = await prisma.userTenant.findFirst({
    where: {
      userId: adminUser.id,
      tenantId: tenant.id,
    },
  });

  if (!existingUserTenant) {
    await prisma.userTenant.create({
      data: {
        userId: adminUser.id,
        tenantId: tenant.id,
        isActive: true,
        isPrimary: true,
      },
    });
    console.log('✅ Usuario asignado al tenant');
  } else {
    console.log('ℹ️  Usuario ya está asignado al tenant');
  }

  // 7. Asignar rol SuperAdmin al usuario admin
  console.log('👑 Asignando rol SuperAdmin al usuario admin...');
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
    },
  });
  console.log('✅ Rol SuperAdmin asignado al usuario admin');

  // 8. Crear aplicaciones del ecosistema
  console.log('📱 Registrando aplicaciones...');

  const prohubApp = await prisma.application.upsert({
    where: { slug: 'prohub' },
    update: {},
    create: {
      name: 'ProHub',
      slug: 'prohub',
      description: 'Portal de Proveedores AXIOMA',
      url: 'http://localhost:3001', // URL en desarrollo
      icon: '/apps/prohub-icon.svg',
      color: '#3B82F6', // blue-500
      order: 1,
      isActive: true,
      isMicrofrontend: true,
      remoteEntry: 'http://localhost:3001/remoteEntry.js',
    },
  });
  console.log(`✅ Aplicación registrada: ${prohubApp.name}`);

  // 9. Habilitar ProHub para el tenant Axioma
  console.log('🔗 Habilitando aplicaciones para el tenant...');
  await prisma.tenantApplication.upsert({
    where: {
      tenantId_applicationId: {
        tenantId: tenant.id,
        applicationId: prohubApp.id,
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      applicationId: prohubApp.id,
      isEnabled: true,
      settings: {},
    },
  });
  console.log('✅ ProHub habilitado para tenant Axioma');

  console.log('\n🎉 Seed completado exitosamente!\n');
  console.log('📋 Credenciales del SuperAdmin:');
  console.log('   Email:    admin@axioma.com');
  console.log('   Password: admin123');
  console.log('   Tenant:   axioma\n');
  console.log('📱 Aplicaciones registradas:');
  console.log(`   - ${prohubApp.name} (${prohubApp.slug})\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

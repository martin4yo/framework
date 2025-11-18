import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';

export async function seedInitialAdmin(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@axioma.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Admin';
    const adminLastName = process.env.ADMIN_LAST_NAME || 'System';
    const tenantName = process.env.DEFAULT_TENANT_NAME || 'Axioma Core';
    const tenantSlug = process.env.DEFAULT_TENANT_SLUG || 'axioma-core';

    // Check if admin user already exists
    const existingAdmin = await queryRunner.manager.findOne(User, {
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('✓ Admin user already exists, skipping seed');
      await queryRunner.commitTransaction();
      return;
    }

    // Create default tenant if it doesn't exist
    let tenant = await queryRunner.manager.findOne(Tenant, {
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      tenant = queryRunner.manager.create(Tenant, {
        name: tenantName,
        slug: tenantSlug,
        isActive: true,
        settings: {},
      });
      await queryRunner.manager.save(tenant);
      console.log(`✓ Created default tenant: ${tenantName}`);
    }

    // Create admin role if it doesn't exist
    let adminRole = await queryRunner.manager.findOne(Role, {
      where: { name: 'admin', tenantId: tenant.id },
    });

    if (!adminRole) {
      adminRole = queryRunner.manager.create(Role, {
        name: 'admin',
        description: 'Administrator role with full permissions',
        tenantId: tenant.id,
        isActive: true,
      });
      await queryRunner.manager.save(adminRole);
      console.log('✓ Created admin role');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const adminUser = queryRunner.manager.create(User, {
      email: adminEmail,
      passwordHash: hashedPassword,
      firstName: adminFirstName,
      lastName: adminLastName,
      tenantId: tenant.id,
      isActive: true,
      isEmailVerified: true,
      roles: [adminRole],
    });

    await queryRunner.manager.save(adminUser);

    console.log('✓ Initial admin user created successfully');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ADMIN CREDENTIALS (CHANGE IMMEDIATELY)  ');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log(`  Tenant: ${tenantSlug}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Error seeding initial admin:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

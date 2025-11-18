import { Injectable } from '@nestjs/common';
import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { User } from '../../users/entities/user.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Role } from '../../roles/entities/role.entity';
import { Permission } from '../entities/permission.entity';

type Subjects = InferSubjects<typeof User | typeof Tenant | typeof Role | typeof Permission> | 'all' | string;

export type AppAbility = Ability<[string, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: any) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>,
    );

    // User permissions from JWT
    if (user.permissions && Array.isArray(user.permissions)) {
      user.permissions.forEach((perm: { resource: string; actions: string[] }) => {
        perm.actions.forEach((action) => {
          can(action, perm.resource as any);
        });
      });
    }

    // Super admin has all permissions
    if (user.roles && user.roles.includes('super_admin')) {
      can('manage', 'all');
    }

    // Tenant admin has all permissions within their tenant
    if (user.roles && user.roles.includes('tenant_admin')) {
      can('manage', 'all', { tenantId: user.tenantId });
    }

    return build({
      detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}

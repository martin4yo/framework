import { Injectable } from '@nestjs/common';
import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
type Subjects = 'User' | 'Tenant' | 'Role' | 'Permission' | 'all' | string;

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
      detectSubjectType: (item: any) => item.constructor?.name || item,
    });
  }
}

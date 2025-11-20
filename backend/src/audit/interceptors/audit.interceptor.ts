import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../audit.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, body, params } = request;

    // Skip audit logs endpoints to avoid recursion
    if (url.includes('/audit-logs')) {
      return next.handle();
    }

    // Check if audit is disabled for this handler
    const skipAudit = this.reflector.get<boolean>(
      'skipAudit',
      context.getHandler(),
    );
    if (skipAudit) {
      return next.handle();
    }

    // Extract entity and action from URL and method
    const { entity, action, entityId } = this.parseRequestInfo(
      method,
      url,
      params,
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          // Only log successful operations
          if (entity && action) {
            this.auditService
              .log(action, entity, {
                tenantId: user?.tenantId || null,
                userId: user?.id || null,
                entityId: entityId || data?.id || null,
                newValue: this.sanitizeData(method === 'POST' || method === 'PATCH' || method === 'PUT' ? body : null),
                ipAddress: request.ip || request.connection?.remoteAddress || null,
                userAgent: request.get('user-agent') || null,
              })
              .catch((error) => {
                // Log error but don't fail the request
                console.error('Audit log failed:', error);
              });
          }
        },
        error: () => {
          // Optionally log failed operations
          // For now, we only log successful operations
        },
      }),
    );
  }

  private parseRequestInfo(
    method: string,
    url: string,
    params: any,
  ): { entity: string | null; action: string | null; entityId: string | null } {
    // Remove query parameters and base URL
    const path = url.split('?')[0];
    const segments = path.split('/').filter((s) => s);

    // Determine action from HTTP method
    let action: string | null = null;
    switch (method) {
      case 'POST':
        action = 'CREATE';
        break;
      case 'PATCH':
      case 'PUT':
        action = 'UPDATE';
        break;
      case 'DELETE':
        action = 'DELETE';
        break;
      default:
        // Don't log GET requests by default
        return { entity: null, action: null, entityId: null };
    }

    // Extract entity name from URL
    let entity: string | null = null;
    let entityId: string | null = null;

    // Common patterns: /users, /users/:id, /tenants/:id, etc.
    if (segments.length > 0) {
      // First segment after base is usually the entity
      entity = this.normalizeEntityName(segments[0]);

      // Check for ID in URL params
      if (params?.id) {
        entityId = params.id;
      }
    }

    // Special cases for nested routes
    if (url.includes('/assign-tenant')) {
      action = 'ASSIGN_TENANT';
      entity = 'UserTenant';
    } else if (url.includes('/unassign-tenant')) {
      action = 'UNASSIGN_TENANT';
      entity = 'UserTenant';
    } else if (url.includes('/primary-tenant')) {
      action = 'SET_PRIMARY_TENANT';
      entity = 'UserTenant';
    } else if (url.includes('/auth/login')) {
      action = 'LOGIN';
      entity = 'Auth';
    } else if (url.includes('/auth/logout')) {
      action = 'LOGOUT';
      entity = 'Auth';
    } else if (url.includes('/auth/register')) {
      action = 'REGISTER';
      entity = 'Auth';
    } else if (url.includes('/auth/reset-password')) {
      action = 'RESET_PASSWORD';
      entity = 'Auth';
    } else if (url.includes('/auth/verify-email')) {
      action = 'VERIFY_EMAIL';
      entity = 'Auth';
    }

    return { entity, action, entityId };
  }

  private normalizeEntityName(segment: string): string {
    // Convert plural to singular and capitalize
    const mapping: Record<string, string> = {
      users: 'User',
      tenants: 'Tenant',
      roles: 'Role',
      permissions: 'Permission',
      auth: 'Auth',
    };

    return mapping[segment.toLowerCase()] || segment;
  }

  private sanitizeData(data: any): Record<string, any> | null {
    if (!data) return null;

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'refreshToken', 'secret'];
    const sanitized = { ...data };

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        delete sanitized[field];
      }
    });

    return sanitized;
  }
}

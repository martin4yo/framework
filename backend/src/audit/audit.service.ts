import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateAuditLogDto {
  tenantId?: string | null;
  userId?: string | null;
  action: string;
  entity?: string; // For backwards compatibility
  resource_type?: string;
  entityId?: string | null; // For backwards compatibility
  resource_id?: string | null;
  oldValue?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
  metadata?: Record<string, any>;
  ipAddress?: string | null;
  userAgent?: string | null;
  description?: string | null;
}

export interface AuditLogFilters {
  tenantId?: string;
  userId?: string;
  action?: string;
  entity?: string; // For backwards compatibility
  resource_type?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

@Injectable()
export class AuditService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<any> {
    // Map old field names to new ones for backwards compatibility
    const data: any = {
      action: createAuditLogDto.action,
      resource_type: createAuditLogDto.resource_type || createAuditLogDto.entity,
      resource_id: createAuditLogDto.resource_id || createAuditLogDto.entityId,
      tenantId: createAuditLogDto.tenantId,
      userId: createAuditLogDto.userId,
      ipAddress: createAuditLogDto.ipAddress,
      userAgent: createAuditLogDto.userAgent,
    };

    // Build metadata from oldValue/newValue
    const metadata: any = createAuditLogDto.metadata || {};
    if (createAuditLogDto.oldValue) {
      metadata.oldValue = createAuditLogDto.oldValue;
    }
    if (createAuditLogDto.newValue) {
      metadata.newValue = createAuditLogDto.newValue;
    }
    if (createAuditLogDto.description) {
      metadata.description = createAuditLogDto.description;
    }

    data.metadata = metadata;

    return this.prisma.auditLog.create({
      data,
    });
  }

  async log(
    action: string,
    entity: string,
    options: Partial<CreateAuditLogDto> = {},
  ): Promise<any> {
    return this.create({
      action,
      entity,
      ...options,
    });
  }

  async findAll(filters: AuditLogFilters = {}): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      tenantId,
      userId,
      action,
      entity,
      resource_type,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = filters;

    const where: any = {};

    if (tenantId) where.tenantId = tenantId;
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (resource_type || entity) where.resource_type = resource_type || entity;

    // Date range filter
    if (startDate && endDate) {
      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    } else if (startDate) {
      where.createdAt = {
        gte: startDate,
        lte: new Date(),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: true,
          tenant: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<any | null> {
    return this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: true,
        tenant: true,
      },
    });
  }

  async deleteOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}

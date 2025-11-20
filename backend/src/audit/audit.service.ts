import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateAuditLogDto {
  tenantId?: string | null;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  oldValue?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  description?: string | null;
}

export interface AuditLogFilters {
  tenantId?: string;
  userId?: string;
  action?: string;
  entity?: string;
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
    return this.prisma.auditLog.create({
      data: createAuditLogDto as any,
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
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = filters;

    const where: any = {};

    if (tenantId) where.tenantId = tenantId;
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entity) where.entity = entity;

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

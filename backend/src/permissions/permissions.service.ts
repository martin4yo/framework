import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<any> {
    const existingPermission = await this.prisma.permission.findFirst({
      where: {
        tenantId: createPermissionDto.tenantId,
        resource: createPermissionDto.resource,
        action: createPermissionDto.action,
      },
    });

    if (existingPermission) {
      throw new ConflictException(
        `El permiso "${createPermissionDto.resource}:${createPermissionDto.action}" ya existe`,
      );
    }

    return this.prisma.permission.create({
      data: createPermissionDto,
    });
  }

  async findAll(tenantId?: string, applicationId?: string): Promise<any[]> {
    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (applicationId) where.applicationId = applicationId;

    return this.prisma.permission.findMany({
      where,
      include: {
        application: true, // Incluir info de la aplicación
      },
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });
  }

  async findOne(id: string): Promise<any> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: { tenant: true },
    });

    if (!permission) {
      throw new NotFoundException(`Permiso con ID "${id}" no encontrado`);
    }

    return permission;
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<any> {
    await this.findOne(id);
    return this.prisma.permission.update({
      where: { id },
      data: updatePermissionDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.permission.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findByResourceAndAction(
    resource: string,
    action: string,
    tenantId?: string,
  ): Promise<any | null> {
    return this.prisma.permission.findFirst({
      where: { resource, action, tenantId },
    });
  }
}

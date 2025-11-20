import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<any> {
    const existingRole = await this.prisma.role.findFirst({
      where: {
        tenantId: createRoleDto.tenantId,
        name: createRoleDto.name,
      },
    });

    if (existingRole) {
      throw new ConflictException('Ya existe un rol con este nombre en este tenant');
    }

    return this.prisma.role.create({
      data: createRoleDto,
    });
  }

  async findAll(tenantId?: string): Promise<any[]> {
    const where = tenantId ? { tenantId } : {};
    return this.prisma.role.findMany({
      where,
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<any> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        tenant: true,
      },
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID "${id}" no encontrado`);
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<any> {
    await this.findOne(id);
    return this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);

    if (role.isSystem) {
      throw new ConflictException('No se pueden eliminar roles del sistema');
    }

    await this.prisma.role.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

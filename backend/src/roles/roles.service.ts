import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { UnassignPermissionDto } from './dto/unassign-permission.dto';

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

  // Permission assignment methods
  async assignPermission(assignPermissionDto: AssignPermissionDto): Promise<any> {
    const { roleId, permissionId } = assignPermissionDto;

    // Verificar que el rol existe
    const role = await this.findOne(roleId);
    if (!role) {
      throw new NotFoundException(`Rol con ID "${roleId}" no encontrado`);
    }

    // Verificar que el permiso existe
    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
    });
    if (!permission) {
      throw new NotFoundException(`Permiso con ID "${permissionId}" no encontrado`);
    }

    // Verificar si ya existe la asignación
    const existingAssignment = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: { roleId, permissionId },
      },
    });

    if (existingAssignment) {
      throw new ConflictException('El rol ya tiene este permiso asignado');
    }

    // Crear la asignación
    return this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
      include: {
        permission: true,
      },
    });
  }

  async unassignPermission(unassignPermissionDto: UnassignPermissionDto): Promise<void> {
    const { roleId, permissionId } = unassignPermissionDto;

    const assignment = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: { roleId, permissionId },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Asignación de permiso no encontrada');
    }

    await this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: { roleId, permissionId },
      },
    });
  }

  async getRolePermissions(roleId: string): Promise<any[]> {
    await this.findOne(roleId); // Verificar que el rol existe

    return this.prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: {
          include: {
            application: true, // Incluir la aplicación del permiso
          },
        },
      },
    });
  }
}

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const existingPermission = await this.permissionsRepository.findOne({
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

    const permission = this.permissionsRepository.create(createPermissionDto);
    return this.permissionsRepository.save(permission);
  }

  async findAll(tenantId?: string): Promise<Permission[]> {
    const where = tenantId ? { tenantId } : {};
    return this.permissionsRepository.find({
      where,
      order: { resource: 'ASC', action: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionsRepository.findOne({
      where: { id },
      relations: ['tenant'],
    });

    if (!permission) {
      throw new NotFoundException(`Permiso con ID "${id}" no encontrado`);
    }

    return permission;
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);
    Object.assign(permission, updatePermissionDto);
    return this.permissionsRepository.save(permission);
  }

  async remove(id: string): Promise<void> {
    const permission = await this.findOne(id);
    await this.permissionsRepository.softRemove(permission);
  }

  async findByResourceAndAction(
    resource: string,
    action: string,
    tenantId?: string,
  ): Promise<Permission | null> {
    return this.permissionsRepository.findOne({
      where: { resource, action, tenantId },
    });
  }
}

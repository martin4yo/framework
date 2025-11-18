import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.rolesRepository.findOne({
      where: {
        tenantId: createRoleDto.tenantId,
        name: createRoleDto.name,
      },
    });

    if (existingRole) {
      throw new ConflictException('Ya existe un rol con este nombre en este tenant');
    }

    const role = this.rolesRepository.create(createRoleDto);
    return this.rolesRepository.save(role);
  }

  async findAll(tenantId?: string): Promise<Role[]> {
    const where = tenantId ? { tenantId } : {};
    return this.rolesRepository.find({
      where,
      relations: ['permissions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: ['permissions', 'tenant'],
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID "${id}" no encontrado`);
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    Object.assign(role, updateRoleDto);
    return this.rolesRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);

    if (role.isSystem) {
      throw new ConflictException('No se pueden eliminar roles del sistema');
    }

    await this.rolesRepository.softRemove(role);
  }
}

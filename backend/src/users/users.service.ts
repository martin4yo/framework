import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { UserTenant } from './entities/user-tenant.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignTenantDto } from './dto/assign-tenant.dto';
import { UnassignTenantDto } from './dto/unassign-tenant.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserTenant)
    private userTenantRepository: Repository<UserTenant>,
    private configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: {
        tenantId: createUserDto.tenantId ?? undefined,
        email: createUserDto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Ya existe un usuario con este email en este tenant');
    }

    let passwordHash: string | undefined;

    // Only hash password if provided (Google users don't have password)
    if (createUserDto.password && createUserDto.password.trim() !== '') {
      const bcryptRounds = parseInt(this.configService.get<string>('BCRYPT_ROUNDS', '10'), 10);
      passwordHash = await bcrypt.hash(createUserDto.password, bcryptRounds);
    }

    const user = this.usersRepository.create({
      ...createUserDto,
      passwordHash,
    });

    return this.usersRepository.save(user);
  }

  async findAll(tenantId?: string): Promise<User[]> {
    const where = tenantId ? { tenantId } : {};
    return this.usersRepository.find({
      where,
      relations: ['tenant', 'roles'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['tenant', 'roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
    }

    return user;
  }

  async findByEmail(email: string, tenantId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email, tenantId },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // If password is provided, hash it
    if (updateUserDto.password && updateUserDto.password.trim() !== '') {
      const bcryptRounds = parseInt(this.configService.get<string>('BCRYPT_ROUNDS', '10'), 10);
      user.passwordHash = await bcrypt.hash(updateUserDto.password, bcryptRounds);
      // Remove password from DTO to avoid assigning it directly
      const { password, ...updateData } = updateUserDto;
      Object.assign(user, updateData);
    } else {
      // Remove password from DTO if it's empty
      const { password, ...updateData } = updateUserDto;
      Object.assign(user, updateData);
    }

    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.softRemove(user);
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const user = await this.findOne(id);
    const bcryptRounds = parseInt(this.configService.get<string>('BCRYPT_ROUNDS', '10'), 10);
    user.passwordHash = await bcrypt.hash(newPassword, bcryptRounds);
    await this.usersRepository.save(user);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    if (!user.passwordHash) {
      return false; // Users with no password (Google OAuth) cannot login with password
    }
    return bcrypt.compare(password, user.passwordHash);
  }

  async findByEmailAcrossTenants(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['tenant', 'roles', 'roles.permissions'],
    });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { emailVerificationToken: token },
      relations: ['tenant', 'roles', 'roles.permissions'],
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { passwordResetToken: token },
      relations: ['tenant', 'roles', 'roles.permissions'],
    });
  }

  // Tenant assignment methods
  async assignTenant(assignTenantDto: AssignTenantDto): Promise<UserTenant> {
    const { userId, tenantId, isPrimary } = assignTenantDto;

    // Verificar que el usuario existe
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado`);
    }

    // Verificar si ya existe la asignación
    const existingAssignment = await this.userTenantRepository.findOne({
      where: { userId, tenantId },
    });

    if (existingAssignment) {
      throw new ConflictException('El usuario ya está asignado a este tenant');
    }

    // Si se marca como primario, desmarcar otros como primarios
    if (isPrimary) {
      await this.userTenantRepository.update(
        { userId, isPrimary: true },
        { isPrimary: false },
      );
    }

    // Crear la asignación
    const userTenant = this.userTenantRepository.create({
      userId,
      tenantId,
      isPrimary: isPrimary ?? false,
    });

    return this.userTenantRepository.save(userTenant);
  }

  async unassignTenant(unassignTenantDto: UnassignTenantDto): Promise<void> {
    const { userId, tenantId } = unassignTenantDto;

    const assignment = await this.userTenantRepository.findOne({
      where: { userId, tenantId },
    });

    if (!assignment) {
      throw new NotFoundException('Asignación no encontrada');
    }

    await this.userTenantRepository.remove(assignment);
  }

  async getUserTenants(userId: string): Promise<UserTenant[]> {
    return this.userTenantRepository.find({
      where: { userId, isActive: true },
      relations: ['tenant'],
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
  }

  async setPrimaryTenant(userId: string, tenantId: string): Promise<void> {
    // Desmarcar todos como no primarios
    await this.userTenantRepository.update(
      { userId },
      { isPrimary: false },
    );

    // Marcar el seleccionado como primario
    const result = await this.userTenantRepository.update(
      { userId, tenantId },
      { isPrimary: true },
    );

    if (result.affected === 0) {
      throw new NotFoundException('Asignación no encontrada');
    }
  }

  async getTenantUsers(tenantId: string): Promise<UserTenant[]> {
    return this.userTenantRepository.find({
      where: { tenantId, isActive: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<any> {
    const existingTenant = await this.prisma.tenant.findFirst({
      where: { slug: createTenantDto.slug },
    });

    if (existingTenant) {
      throw new ConflictException(`Ya existe un tenant con el slug "${createTenantDto.slug}"`);
    }

    return this.prisma.tenant.create({
      data: createTenantDto,
    });
  }

  async findAll(): Promise<any[]> {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<any> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new NotFoundException(`Tenant con ID "${id}" no encontrado`);
    }
    return tenant;
  }

  async findBySlug(slug: string): Promise<any | null> {
    return this.prisma.tenant.findFirst({ where: { slug } });
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<any> {
    const tenant = await this.findOne(id);

    if (updateTenantDto.slug && updateTenantDto.slug !== tenant.slug) {
      const existingTenant = await this.findBySlug(updateTenantDto.slug);
      if (existingTenant) {
        throw new ConflictException(`Ya existe un tenant con el slug "${updateTenantDto.slug}"`);
      }
    }

    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
    });
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    await this.prisma.tenant.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findDefaultTenant(): Promise<any | null> {
    // Find the first active tenant or create logic for default tenant
    // You can customize this logic based on your needs
    const tenant = await this.prisma.tenant.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    return tenant;
  }
}

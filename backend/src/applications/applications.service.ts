import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { AssignTenantDto } from './dto/assign-tenant.dto';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(createApplicationDto: CreateApplicationDto): Promise<any> {
    const existingApp = await this.prisma.application.findUnique({
      where: { slug: createApplicationDto.slug },
    });

    if (existingApp) {
      throw new ConflictException('Ya existe una aplicación con este slug');
    }

    return this.prisma.application.create({
      data: createApplicationDto,
    });
  }

  async findAll(): Promise<any[]> {
    return this.prisma.application.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string): Promise<any> {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        tenantApplications: {
          include: {
            tenant: true,
          },
        },
        permissions: true,
      },
    });

    if (!application) {
      throw new NotFoundException(`Aplicación con ID "${id}" no encontrada`);
    }

    return application;
  }

  async update(id: string, updateApplicationDto: UpdateApplicationDto): Promise<any> {
    await this.findOne(id);

    return this.prisma.application.update({
      where: { id },
      data: updateApplicationDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.application.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Tenant assignment methods
  async assignToTenant(assignTenantDto: AssignTenantDto): Promise<any> {
    const { applicationId, tenantId, isEnabled, settings } = assignTenantDto;

    // Verificar que la aplicación existe
    await this.findOne(applicationId);

    // Verificar que el tenant existe
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException(`Tenant con ID "${tenantId}" no encontrado`);
    }

    // Verificar si ya existe la asignación
    const existingAssignment = await this.prisma.tenantApplication.findUnique({
      where: {
        tenantId_applicationId: { tenantId, applicationId },
      },
    });

    if (existingAssignment) {
      // Si ya existe, actualizar
      const updateData: any = {
        isEnabled: isEnabled ?? existingAssignment.isEnabled,
      };

      if (settings !== undefined) {
        updateData.settings = settings;
      }

      return this.prisma.tenantApplication.update({
        where: {
          tenantId_applicationId: { tenantId, applicationId },
        },
        data: updateData,
        include: {
          application: true,
          tenant: true,
        },
      });
    }

    // Crear nueva asignación
    return this.prisma.tenantApplication.create({
      data: {
        applicationId,
        tenantId,
        isEnabled: isEnabled ?? true,
        settings: settings ?? {},
      },
      include: {
        application: true,
        tenant: true,
      },
    });
  }

  async unassignFromTenant(applicationId: string, tenantId: string): Promise<void> {
    const assignment = await this.prisma.tenantApplication.findUnique({
      where: {
        tenantId_applicationId: { tenantId, applicationId },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Asignación no encontrada');
    }

    await this.prisma.tenantApplication.delete({
      where: {
        tenantId_applicationId: { tenantId, applicationId },
      },
    });
  }

  async getApplicationsByTenant(tenantId: string): Promise<any[]> {
    const assignments = await this.prisma.tenantApplication.findMany({
      where: { tenantId, isEnabled: true },
      include: {
        application: true,
      },
      orderBy: {
        application: { order: 'asc' },
      },
    });

    return assignments.map((a) => a.application);
  }

  async getTenantsByApplication(applicationId: string): Promise<any[]> {
    await this.findOne(applicationId);

    const assignments = await this.prisma.tenantApplication.findMany({
      where: { applicationId },
      include: {
        tenant: true,
      },
    });

    return assignments.map((a) => ({
      ...a.tenant,
      isEnabled: a.isEnabled,
      settings: a.settings,
    }));
  }
}

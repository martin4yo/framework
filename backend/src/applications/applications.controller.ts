import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { AssignTenantDto } from './dto/assign-tenant.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.create(createApplicationDto);
  }

  @Get()
  findAll() {
    return this.applicationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateApplicationDto: UpdateApplicationDto) {
    return this.applicationsService.update(id, updateApplicationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.applicationsService.remove(id);
  }

  // Tenant assignment endpoints
  @Post('assign-tenant')
  @HttpCode(HttpStatus.CREATED)
  assignToTenant(@Body() assignTenantDto: AssignTenantDto) {
    return this.applicationsService.assignToTenant(assignTenantDto);
  }

  @Delete(':applicationId/tenants/:tenantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  unassignFromTenant(
    @Param('applicationId') applicationId: string,
    @Param('tenantId') tenantId: string,
  ) {
    return this.applicationsService.unassignFromTenant(applicationId, tenantId);
  }

  @Get('tenant/:tenantId')
  getApplicationsByTenant(@Param('tenantId') tenantId: string) {
    return this.applicationsService.getApplicationsByTenant(tenantId);
  }

  @Get(':applicationId/tenants')
  getTenantsByApplication(@Param('applicationId') applicationId: string) {
    return this.applicationsService.getTenantsByApplication(applicationId);
  }
}

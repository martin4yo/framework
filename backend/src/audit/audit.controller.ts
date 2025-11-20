import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuditService, AuditLogFilters } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SkipAudit } from './decorators/skip-audit.decorator';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
@SkipAudit()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() filters: AuditLogFilters) {
    // Convert string dates to Date objects
    if (filters.startDate) {
      filters.startDate = new Date(filters.startDate);
    }
    if (filters.endDate) {
      filters.endDate = new Date(filters.endDate);
    }

    // Convert page and limit to numbers
    if (filters.page) {
      filters.page = Number(filters.page);
    }
    if (filters.limit) {
      filters.limit = Number(filters.limit);
    }

    return this.auditService.findAll(filters);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return this.auditService.findOne(id);
  }
}

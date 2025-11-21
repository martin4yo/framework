import { IsUUID, IsBoolean, IsOptional, IsObject } from 'class-validator';

export class AssignTenantDto {
  @IsUUID()
  applicationId: string;

  @IsUUID()
  tenantId: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

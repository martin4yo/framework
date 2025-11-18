import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class AssignTenantDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

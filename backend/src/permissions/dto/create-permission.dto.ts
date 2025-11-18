import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
  IsObject,
} from 'class-validator';

export class CreatePermissionDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  resource: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  action: string;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;

  @IsOptional()
  @IsString()
  description?: string;
}

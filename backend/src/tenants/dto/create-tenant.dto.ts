import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsObject } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  slug: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

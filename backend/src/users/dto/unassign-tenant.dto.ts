import { IsString, IsNotEmpty } from 'class-validator';

export class UnassignTenantDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  tenantId: string;
}

import { IsUUID, IsOptional, IsString } from 'class-validator';

export class AssignRoleDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  roleId: string;

  @IsOptional()
  @IsUUID()
  assignedBy?: string;
}

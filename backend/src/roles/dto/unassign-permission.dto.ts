import { IsUUID } from 'class-validator';

export class UnassignPermissionDto {
  @IsUUID()
  roleId: string;

  @IsUUID()
  permissionId: string;
}

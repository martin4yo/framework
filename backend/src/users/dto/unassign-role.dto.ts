import { IsUUID } from 'class-validator';

export class UnassignRoleDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  roleId: string;
}

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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { UnassignPermissionDto } from './dto/unassign-permission.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  findAll(@Query('tenantId') tenantId?: string) {
    return this.rolesService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }

  // Permission assignment endpoints
  @Post('assign-permission')
  @HttpCode(HttpStatus.CREATED)
  assignPermission(@Body() assignPermissionDto: AssignPermissionDto) {
    return this.rolesService.assignPermission(assignPermissionDto);
  }

  @Post('unassign-permission')
  @HttpCode(HttpStatus.OK)
  unassignPermission(@Body() unassignPermissionDto: UnassignPermissionDto) {
    return this.rolesService.unassignPermission(unassignPermissionDto);
  }

  @Get(':id/permissions')
  getRolePermissions(@Param('id') roleId: string) {
    return this.rolesService.getRolePermissions(roleId);
  }
}

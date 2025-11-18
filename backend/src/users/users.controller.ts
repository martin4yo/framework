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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignTenantDto } from './dto/assign-tenant.dto';
import { UnassignTenantDto } from './dto/unassign-tenant.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query('tenantId') tenantId?: string) {
    return this.usersService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/password')
  @HttpCode(HttpStatus.OK)
  updatePassword(@Param('id') id: string, @Body() body: { password: string }) {
    return this.usersService.updatePassword(id, body.password);
  }

  // Tenant assignment endpoints
  @Post('assign-tenant')
  @HttpCode(HttpStatus.CREATED)
  assignTenant(@Body() assignTenantDto: AssignTenantDto) {
    return this.usersService.assignTenant(assignTenantDto);
  }

  @Post('unassign-tenant')
  @HttpCode(HttpStatus.OK)
  unassignTenant(@Body() unassignTenantDto: UnassignTenantDto) {
    return this.usersService.unassignTenant(unassignTenantDto);
  }

  @Get(':id/tenants')
  getUserTenants(@Param('id') userId: string) {
    return this.usersService.getUserTenants(userId);
  }

  @Patch(':userId/primary-tenant/:tenantId')
  @HttpCode(HttpStatus.OK)
  setPrimaryTenant(
    @Param('userId') userId: string,
    @Param('tenantId') tenantId: string,
  ) {
    return this.usersService.setPrimaryTenant(userId, tenantId);
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { Permission } from './entities/permission.entity';
import { CaslAbilityFactory } from './casl/casl-ability.factory';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  controllers: [PermissionsController],
  providers: [PermissionsService, CaslAbilityFactory],
  exports: [PermissionsService, CaslAbilityFactory],
})
export class PermissionsModule {}

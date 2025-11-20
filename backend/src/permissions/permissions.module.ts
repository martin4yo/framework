import { Module } from '@nestjs/common';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { CaslAbilityFactory } from './casl/casl-ability.factory';

@Module({
  imports: [],
  controllers: [PermissionsController],
  providers: [PermissionsService, CaslAbilityFactory],
  exports: [PermissionsService, CaslAbilityFactory],
})
export class PermissionsModule {}

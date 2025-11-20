import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional, IsString, MinLength, MaxLength, IsDate } from 'class-validator';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['tenantId'] as const),
) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password?: string;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @IsOptional()
  @IsString()
  emailVerificationToken?: string | null;

  @IsOptional()
  @IsDate()
  emailVerificationExpires?: Date | null;

  @IsOptional()
  @IsString()
  passwordResetToken?: string | null;

  @IsOptional()
  @IsDate()
  passwordResetExpires?: Date | null;

  @IsOptional()
  @IsDate()
  lastLoginAt?: Date | null;
}

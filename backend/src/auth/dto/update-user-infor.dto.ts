import { Optional } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class updateUserInforDto {
  @Optional()
  @IsString()
  displayName: string;

  @Optional()
  @IsString()
  contactPhone: string;

  @Optional()
  @IsString()
  email: string;

  @Optional()
  @IsString()
  avaUrl: string;
}

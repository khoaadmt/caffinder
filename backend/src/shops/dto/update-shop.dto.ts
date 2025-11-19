import { CreateShopDto } from './create-shops.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateShopDto extends PartialType(CreateShopDto) {}

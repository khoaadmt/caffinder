import { CreateShopDto } from './createShops.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateShopDto extends PartialType(CreateShopDto) {}

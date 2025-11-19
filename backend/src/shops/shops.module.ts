import { Module } from '@nestjs/common';
import { Shops } from './entities/shops.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopService } from './service/shops.service';
import { ShopController } from './shops.controller';
import { ShopRepository } from './repository/shops.repository';

require('dotenv').config();

@Module({
  imports: [TypeOrmModule.forFeature([Shops])],
  providers: [ShopService, ShopRepository],
  controllers: [ShopController],
})
export class ShopsModule {}

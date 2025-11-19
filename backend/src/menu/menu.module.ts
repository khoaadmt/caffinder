import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { MenuItem } from './entities/menu-item.entity';
import { MenuController } from './menu.controller';
import { MenuRepository } from './repositories/menu.repository';
import { Shops } from 'src/shops/entities/shops.entity';
import { ShopRepository } from 'src/shops/repository/shops.repository';
import { MenuService } from './service/menu.service';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, MenuItem, Shops])],
  controllers: [MenuController],
  providers: [MenuService, MenuRepository, ShopRepository],
  exports: [MenuService, MenuRepository],
})
export class MenuModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { FavoriteController } from './favorite.controller';
import { Shops } from 'src/shops/entities/shops.entity';
import { ShopRepository } from 'src/shops/repository/shops.repository';
import { FavoriteRepository } from './repositories/favorite.repository';
import { FavoriteService } from './service/favorite.service';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Shops])],
  controllers: [FavoriteController],
  providers: [FavoriteService, FavoriteRepository, ShopRepository],
  exports: [FavoriteService, FavoriteRepository],
})
export class FavoriteModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewController } from './review.controller';
import { ReviewRepository } from './repositories/review.repository';
import { Shops } from 'src/shops/entities/shops.entity';
import { ShopRepository } from 'src/shops/repository/shops.repository';
import { ReviewService } from './service/review.service';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Shops])],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository, ShopRepository],
  exports: [ReviewService, ReviewRepository],
})
export class ReviewModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Bookings } from './entities/bookings.entity';
import { Shops } from '../shops/entities/shops.entity';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './service/bookings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bookings, Shops])],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}

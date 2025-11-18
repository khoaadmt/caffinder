import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Bookings } from './entities/bookings.entity';
import { Shops } from '../shops/entities/shops.entity';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './service/bookings.service';
import { BookingRepository } from './repository/booking.repository';
import { ShopRepository } from 'src/shops/repository/shops.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Bookings, Shops])],
  controllers: [BookingsController],
  providers: [BookingsService, BookingRepository, ShopRepository],
  exports: [BookingsService],
})
export class BookingsModule {}

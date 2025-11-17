import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookings, BookingStatus } from '../entities/bookings.entity';
import { CreateBookingDto } from '../dto/create-booking.dto';

@Injectable()
export class BookingRepository {
  constructor(
    @InjectRepository(Bookings)
    private bookingsRepo: Repository<Bookings>,
  ) {}

  async create(
    createBookingDto: CreateBookingDto,
    userId: number,
    shopId: number,
    endTime: string,
    duration: number,
  ) {
    const newBooking = this.bookingsRepo.create({
      ...createBookingDto,
      user: { id: userId },
      shop: { id: shopId },
      endTime,
      duration,
    });
    await this.bookingsRepo.save(newBooking);

    return newBooking;
  }

  async getBookingsInTime(
    shopId: number,
    date: string,
    requestStart: moment.Moment,
    requestEnd: moment.Moment,
  ) {
    return await this.bookingsRepo
      .createQueryBuilder('booking')
      .where('booking.shopId = :shopId', { shopId })
      .andWhere('booking.bookingDate = :date', { date })
      .andWhere('booking.status IN (:...statuses)', {
        statuses: [BookingStatus.CONFIRMED, BookingStatus.PENDING],
      })
      .andWhere(
        `(booking."bookingTime")::time < :requestEnd AND (booking."endTime")::time > :requestStart`,
        {
          requestStart: requestStart.format('HH:mm:ss'),
          requestEnd: requestEnd.format('HH:mm:ss'),
        },
      )
      .getMany();
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookings } from '../entities/bookings.entity';

@Injectable()
export class BookingRepository {
  constructor(
    @InjectRepository(Bookings)
    private bookingRepo: Repository<Bookings>,
  ) {}
}

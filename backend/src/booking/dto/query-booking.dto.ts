import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import { BookingStatus } from '../entities/bookings.entity';

export class QueryBookingDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;
}

import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDateString,
  IsOptional,
  Min,
  Max,
  Matches,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  shopId: number;

  @IsDateString()
  @IsNotEmpty()
  bookingDate: string;

  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'bookingTime must be in format HH:mm',
  })
  @IsNotEmpty()
  bookingTime: string;

  @IsNumber()
  @Min(1)
  @Max(50)
  @IsNotEmpty()
  @Type(() => Number)
  numberOfGuests: number;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @Matches(/^(0|\+84)[0-9]{9,10}$/, {
    message: 'Phone number must be valid Vietnamese format',
  })
  @IsNotEmpty()
  customerPhone: string;

  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @IsString()
  @IsOptional()
  preferredLocation?: string;

  @IsString()
  @IsOptional()
  note?: string;
}

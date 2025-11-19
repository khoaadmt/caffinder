import {
  IsNumber,
  IsNotEmpty,
  IsDateString,
  Matches,
  Min,
  IsString,
  IsOptional,
} from 'class-validator';

export class CheckAvailabilityDto {
  @IsNumber()
  @IsNotEmpty()
  shopId: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  @IsNotEmpty()
  time: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  numberOfGuests: number;

  @IsString()
  @IsOptional()
  preferredLocation?: string;
}

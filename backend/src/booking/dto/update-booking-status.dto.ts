import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class RejectBookingDto {
  @IsString()
  @IsNotEmpty()
  rejectionReason: string;
}

export class CancelBookingDto {
  @IsString()
  @IsOptional()
  cancelReason?: string;
}

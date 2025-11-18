import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RejectBookingDto } from './dto/update-booking-status.dto';
import { BookingsService } from './service/bookings.service';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { QueryBookingDto } from './dto/query-booking.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/utils/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('check-availability')
  async checkAvailability(@Body() dto: CheckAvailabilityDto) {
    return await this.bookingsService.checkAvailability(dto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createBooking(@Request() req, @Body() dto: CreateBookingDto) {
    return await this.bookingsService.createBooking(req.user.user_id, dto);
  }

  // @Get('my')
  // @UseGuards(JwtAuthGuard)
  // async getMyBookings(@Request() req, @Query() query: QueryBookingDto) {
  //   return await this.bookingsService.getUserBookings(req.user.user_id, query);
  // }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getBookingDetail(
    @Param('id', ParseIntPipe) bookingId: number,
    @Request() req,
  ) {
    console.log('req.user.id :', req.user.id);
    return await this.bookingsService.getBookingDetail(
      bookingId,
      req.user.user_id,
    );
  }

  /**
   * CANCEL BOOKING (User)
   * PATCH /bookings/:id/cancel
   */
  // @Patch(':id/cancel')
  // @UseGuards(JwtAuthGuard)
  // async cancelBooking(
  //   @Param('id', ParseIntPipe) bookingId: number,
  //   @Request() req,
  // ) {
  //   return await this.bookingsService.cancelBooking(bookingId, req.user.id);
  // }

  /**
   * GET SHOP BOOKINGS (Owner)
   * GET /bookings/by-shop/:shopId?date=2025-11-20&status=pending
   */
  @Get('by-shop/:shopId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  async getShopBookings(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Request() req,
    @Query() query: QueryBookingDto,
  ) {
    return await this.bookingsService.getShopBookings(
      shopId,
      req.user.user_id,
      query,
    );
  }

  /**
   * CONFIRM BOOKING (Owner)
   * PATCH /bookings/:id/confirm
   */
  // @Patch(':id/confirm')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('shop_owner')
  // async confirmBooking(
  //   @Param('id', ParseIntPipe) bookingId: number,
  //   @Request() req,
  // ) {
  //   return await this.bookingsService.confirmBooking(bookingId, req.user.id);
  // }

  /**
   * REJECT BOOKING (Owner)
   * PATCH /bookings/:id/reject
   */
  // @Patch(':id/reject')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('shop_owner')
  // async rejectBooking(
  //   @Param('id', ParseIntPipe) bookingId: number,
  //   @Request() req,
  //   @Body() dto: RejectBookingDto,
  // ) {
  //   return await this.bookingsService.rejectBooking(
  //     bookingId,
  //     req.user.id,
  //     dto,
  //   );
  // }
}

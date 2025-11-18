import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Shops } from 'src/shops/entities/shops.entity';
import { Bookings, BookingStatus } from '../entities/bookings.entity';
import { CheckAvailabilityDto } from '../dto/check-availability.dto';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { QueryBookingDto } from '../dto/query-booking.dto';
import * as moment from 'moment';
import { BookingRepository } from '../repository/booking.repository';
import { RejectBookingDto } from '../dto/update-booking-status.dto';
import { ShopRepository } from 'src/shops/repository/shops.repository';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Bookings)
    private bookingsRepo: Repository<Bookings>,
    private readonly bookingsRepository: BookingRepository,
    private readonly shopRepository: ShopRepository,
  ) {}

  async checkAvailability(dto: CheckAvailabilityDto) {
    const { shopId, date, time, numberOfGuests, preferredLocation } = dto;

    const shop = await this.shopRepository.findOneById(shopId);
    if (!shop) {
      throw new NotFoundException('Quán không tồn tại');
    }

    if (shop.status !== 'approved') {
      throw new BadRequestException('Quán chưa được duyệt hoặc đang bị khóa');
    }

    const bookingDateTime = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
    const now = moment();

    if (bookingDateTime.isBefore(now)) {
      throw new BadRequestException('Không thể đặt bàn trong quá khứ');
    }

    const minAdvanceTime = now.clone().add(30, 'minutes');
    if (bookingDateTime.isBefore(minAdvanceTime)) {
      throw new BadRequestException('Vui lòng đặt bàn trước ít nhất 30 phút');
    }

    const bookingTimeOnly = moment(time, 'HH:mm');
    const openTime = moment(shop.openTime, 'HH:mm');
    const closeTime = moment(shop.closeTime, 'HH:mm');

    if (
      bookingTimeOnly.isBefore(openTime) ||
      bookingTimeOnly.isAfter(closeTime)
    ) {
      throw new BadRequestException(
        `Quán chỉ mở cửa từ ${shop.openTime} đến ${shop.closeTime}`,
      );
    }

    const endTime = bookingTimeOnly
      .clone()
      .add(shop.defaultDuration, 'minutes');
    if (endTime.isAfter(closeTime)) {
      throw new BadRequestException(
        `Với thời gian ${shop.defaultDuration} phút, bạn cần đặt trước ${closeTime}`,
      );
    }

    const requestStart = moment(time, 'HH:mm');
    const requestEnd = requestStart
      .clone()
      .add(shop.defaultDuration, 'minutes');

    const overlappingBookings = await this.bookingsRepository.getBookingsInTime(
      shopId,
      date,
      requestStart,
      requestEnd,
    );

    let occupiedSeats = this.countSeats(
      overlappingBookings,
      BookingStatus.CONFIRMED,
    );

    const seatsWating = this.countSeats(
      overlappingBookings,
      BookingStatus.PENDING,
    );

    const maxCapacity = shop.totalCapacity;
    const effectiveCapacity = Math.floor(
      maxCapacity * Number(shop.overbookingRate),
    );
    const availableSeats = effectiveCapacity - occupiedSeats;

    let confidence: 'high' | 'medium' | 'low';
    if (availableSeats > numberOfGuests * 2) {
      confidence = 'high';
    } else if (availableSeats > numberOfGuests * 1.2) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }

    let suggestedTimes = null;
    if (availableSeats < numberOfGuests) {
      suggestedTimes = await this.suggestAlternativeTimes(
        shopId,
        date,
        time,
        numberOfGuests,
      );
    }

    return {
      isAvailable: availableSeats >= numberOfGuests,
      availableSeats,
      requestedSeats: numberOfGuests,
      maxCapacity,
      effectiveCapacity,
      occupiedSeats,
      seatsWating,
      confidence,
      duration: shop.defaultDuration,
      estimatedEndTime: requestEnd.format('HH:mm'),
      message:
        availableSeats >= numberOfGuests
          ? `Còn ${availableSeats} chỗ trống`
          : `Không đủ chỗ. Còn ${availableSeats} chỗ, cần ${numberOfGuests} chỗ`,
      suggestedTimes,
    };
  }

  countSeats(booking: Bookings[], status: BookingStatus) {
    return booking
      .filter((b) => b.status == status)
      .reduce((acc, b) => {
        return (acc += b.numberOfGuests);
      }, 0);
  }

  private async suggestAlternativeTimes(
    shopId: number,
    date: string,
    requestedTime: string,
    numberOfGuests: number,
  ) {
    const suggestions = [];
    const requestedMoment = moment(requestedTime, 'HH:mm');

    const offsets = [-60, -30, 30, 60];

    for (const offset of offsets) {
      const altTime = requestedMoment.clone().add(offset, 'minutes');

      try {
        const result = await this.checkAvailability({
          shopId,
          date,
          time: altTime.format('HH:mm'),
          numberOfGuests,
        });

        if (result.isAvailable) {
          suggestions.push({
            time: altTime.format('HH:mm'),
            availableSeats: result.availableSeats,
            confidence: result.confidence,
          });
        }
      } catch (error) {
        continue;
      }
    }

    return suggestions.slice(0, 3);
  }

  async createBooking(userId: number, dto: CreateBookingDto) {
    const availability = await this.checkAvailability({
      shopId: dto.shopId,
      date: dto.bookingDate,
      time: dto.bookingTime,
      numberOfGuests: dto.numberOfGuests,
      preferredLocation: dto.preferredLocation,
    });

    if (!availability.isAvailable) {
      const suggestions =
        availability.suggestedTimes?.map((t) => t.time).join(', ') ||
        'Không có';
      throw new BadRequestException(
        `${availability.message}. Thời gian gợi ý: ${suggestions}`,
      );
    }

    const shop = await this.shopRepository.findOneById(dto.shopId);

    const bookingTimeMoment = moment(dto.bookingTime, 'HH:mm');
    const endTime = bookingTimeMoment
      .clone()
      .add(shop.defaultDuration, 'minutes')
      .format('HH:mm');

    const newBooking = await this.bookingsRepository.create(
      dto,
      userId,
      shop.id,
      endTime,
      shop.defaultDuration,
    );

    return {
      success: true,
      booking: newBooking,
      message: 'Đặt bàn thành công! Vui lòng chờ quán xác nhận.',
    };
  }

  /**
   * GET USER BOOKINGS
   */
  async getUserBookings(userId: number, query?: QueryBookingDto) {
    const where: any = { user: { id: userId } };

    if (query?.date) {
      where.bookingDate = query.date;
    }

    if (query?.status) {
      where.status = query.status;
    }

    const bookings = await this.bookingsRepo.find({
      where,
      relations: ['shop'],
      order: { bookingDate: 'DESC', bookingTime: 'DESC' },
    });

    return {
      success: true,
      count: bookings.length,
      bookings,
    };
  }

  /**
   * GET BOOKING DETAIL
   */
  async getBookingDetail(bookingId: number, userId: number) {
    const booking = await this.bookingsRepository.findById(bookingId);

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    if (booking.user.id !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem booking này');
    }

    return {
      success: true,
      booking,
    };
  }

  /**
   * GET SHOP BOOKINGS (Owner)
   */
  async getShopBookings(
    shopId: number,
    ownerId: number,
    query?: QueryBookingDto,
  ) {
    const shop = await this.shopRepository.findOneById(shopId);

    if (!shop) {
      throw new NotFoundException('Quán không tồn tại');
    }

    if (shop.owner.id !== ownerId) {
      throw new ForbiddenException('Bạn không phải chủ quán này');
    }

    const where: any = { shopId };

    if (query?.date) {
      where.bookingDate = query.date;
    }

    if (query?.status) {
      where.status = query.status;
    }

    const bookings = await this.bookingsRepo.find({
      relations: ['user'],
      select: {
        user: {
          id: true,
          displayName: true,
          avaUrl: true,
          contactPhone: true,
        },
      },
      order: { bookingDate: 'ASC', bookingTime: 'ASC' },
    });

    // Group by date for better UX
    const grouped = bookings.reduce((acc, booking) => {
      const date = moment(booking.bookingDate).format('YYYY-MM-DD');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(booking);
      return acc;
    }, {});

    return {
      success: true,
      count: bookings.length,
      bookings,
      groupedByDate: grouped,
    };
  }

  /**
   * CONFIRM BOOKING (Owner)
   */
  async confirmBooking(bookingId: number, ownerId: number) {
    const booking = await this.bookingsRepository.findById(bookingId);
    console.log('booking :', booking);

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    if (booking.shop.owner.id !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền xác nhận booking này');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(
        `Booking đã ở trạng thái ${booking.status}, không thể xác nhận`,
      );
    }

    const availability = await this.checkAvailability({
      shopId: booking.shop.id,
      date: moment(booking.bookingDate).format('YYYY-MM-DD'),
      time: booking.bookingTime,
      numberOfGuests: booking.numberOfGuests,
    });

    if (!availability.isAvailable) {
      throw new BadRequestException(
        'Không thể xác nhận booking này do không đủ chỗ (có booking khác được xác nhận trước)',
      );
    }

    booking.status = BookingStatus.CONFIRMED;
    booking.confirmedAt = new Date();

    await this.bookingsRepo.save(booking);

    // TODO: Send notification to user

    return {
      success: true,
      booking,
      message: 'Đã xác nhận booking thành công',
    };
  }

  /**
   * REJECT BOOKING (Owner)
   */
  async rejectBooking(
    bookingId: number,
    ownerId: number,
    dto: RejectBookingDto,
  ) {
    const booking = await this.bookingsRepository.findById(bookingId);

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    if (booking.shop.owner.id !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền từ chối booking này');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(
        `Booking đã ở trạng thái ${booking.status}, không thể từ chối`,
      );
    }

    booking.status = BookingStatus.REJECTED;
    booking.rejectionReason = dto.rejectionReason;

    await this.bookingsRepo.save(booking);

    // TODO: Send notification to user

    return {
      success: true,
      booking,
      message: 'Đã từ chối booking',
    };
  }

  //  CANCEL BOOKING (User)

  async cancelBooking(bookingId: number, userId: number) {
    const booking = await this.bookingsRepo
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .addSelect([
        'user.id',
        'user.displayName',
        'user.username',
        'user.avaUrl',
      ])
      .getOne();

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    if (booking.user.id !== userId) {
      throw new ForbiddenException('Bạn không có quyền hủy booking này');
    }

    if (
      ![BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status)
    ) {
      throw new BadRequestException(
        `Booking đã ở trạng thái ${booking.status}, không thể hủy`,
      );
    }

    // Check phải hủy trước giờ booking ít nhất 2 tiếng
    const bookingDateTime = moment(
      `${booking.bookingDate} ${booking.bookingTime}`,
      'YYYY-MM-DD HH:mm',
    );
    const now = moment();
    const minCancelTime = bookingDateTime.clone().subtract(2, 'hours');

    if (now.isAfter(minCancelTime)) {
      throw new BadRequestException(
        'Chỉ có thể hủy booking trước giờ đặt ít nhất 2 tiếng',
      );
    }

    booking.status = BookingStatus.CANCELLED;

    await this.bookingsRepo.save(booking);

    // TODO: Send notification to shop owner

    return {
      success: true,
      booking,
      message: 'Đã hủy booking thành công',
    };
  }
}

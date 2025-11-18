import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/utils/roles.guard';
import {
  CreateReviewDto,
  QueryReviewDto,
  ReplyReviewDto,
} from './dto/create-review.dto';
import { ReviewService } from './service/review.service';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post(':shopId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async createReview(
    @Req() req,
    @Param('shopId', ParseIntPipe) shopId: number,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    const userId = req.user.user_id;
    return await this.reviewService.createReview(
      userId,
      shopId,
      createReviewDto,
    );
  }

  @Get(':shopId')
  async getShopReviews(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Query() query: QueryReviewDto,
  ) {
    return await this.reviewService.getShopReviews(shopId, query);
  }

  @Get('my/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  async getMyReviews(@Req() req) {
    const userId = req.user.user_id;
    return await this.reviewService.getMyReviews(userId);
  }

  @Patch(':id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  async replyReview(
    @Req() req,
    @Param('id', ParseIntPipe) reviewId: number,
    @Body() replyReviewDto: ReplyReviewDto,
  ) {
    const ownerId = req.user.user_id;
    return await this.reviewService.replyReview(
      reviewId,
      ownerId,
      replyReviewDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteReview(@Req() req, @Param('id', ParseIntPipe) reviewId: number) {
    const adminId = req.user.user_id;
    return await this.reviewService.deleteReview(reviewId, adminId);
  }
}

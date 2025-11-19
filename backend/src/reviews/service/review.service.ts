import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ShopRepository } from 'src/shops/repository/shops.repository';
import {
  CreateReviewDto,
  QueryReviewDto,
  ReplyReviewDto,
} from '../dto/create-review.dto';
import { ReviewRepository } from '../repositories/review.repository';

@Injectable()
export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly shopRepository: ShopRepository,
  ) {}

  async createReview(
    userId: number,
    shopId: number,
    createReviewDto: CreateReviewDto,
  ) {
    const shop = await this.shopRepository.findOneById(shopId);
    if (!shop) {
      throw new NotFoundException('Shop không tồn tại');
    }

    if (shop.status !== 'approved') {
      throw new BadRequestException('Shop chưa được duyệt, không thể đánh giá');
    }

    const hasReviewed = await this.reviewRepository.checkUserReviewed(
      userId,
      shopId,
    );
    if (hasReviewed) {
      throw new BadRequestException('Bạn đã đánh giá shop này rồi');
    }

    const review = await this.reviewRepository.create(
      userId,
      shopId,
      createReviewDto.rating,
      createReviewDto.comment,
      createReviewDto.img,
    );

    return {
      message: 'Đánh giá thành công',
      data: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        img: review.img,
        createdAt: review.createdAt,
      },
    };
  }

  async getShopReviews(shopId: number, query: QueryReviewDto) {
    const shop = await this.shopRepository.findOneById(shopId);
    if (!shop) {
      throw new NotFoundException('Shop không tồn tại');
    }

    const { reviews, total, avgRating } =
      await this.reviewRepository.findByShop(shopId, query);

    const stats = await this.reviewRepository.getShopRatingStats(shopId);

    return {
      message: 'Lấy danh sách đánh giá thành công',
      data: reviews,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 10,
        total,
        totalPages: Math.ceil(total / (query.limit || 10)),
      },
      stats,
    };
  }

  async getMyReviews(userId: number) {
    const reviews = await this.reviewRepository.findByUser(userId);

    return {
      message: 'Lấy danh sách đánh giá của bạn thành công',
      data: reviews,
      total: reviews.length,
    };
  }

  async replyReview(
    reviewId: number,
    ownerId: number,
    replyReviewDto: ReplyReviewDto,
  ) {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundException('Review không tồn tại');
    }

    if (review.shop.owner.id !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền phản hồi review này');
    }

    if (review.ownerReply) {
      throw new BadRequestException('Review này đã được phản hồi rồi');
    }

    const updatedReview = await this.reviewRepository.reply(
      reviewId,
      replyReviewDto.ownerReply,
    );

    return {
      message: 'Phản hồi đánh giá thành công',
      data: {
        id: updatedReview.id,
        ownerReply: updatedReview.ownerReply,
        repliedAt: updatedReview.repliedAt,
      },
    };
  }

  async deleteReview(reviewId: number, adminId: number) {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundException('Review không tồn tại');
    }

    await this.reviewRepository.delete(reviewId);

    return {
      message: 'Xóa đánh giá thành công',
    };
  }
}

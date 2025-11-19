import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { QueryReviewDto } from '../dto/create-review.dto';

@Injectable()
export class ReviewRepository {
  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
  ) {}

  async findById(id: number): Promise<Review | null> {
    return await this.reviewRepo.findOne({
      where: { id },
      relations: {
        user: true,
        shop: {
          owner: true,
        },
      },
      select: {
        user: {
          id: true,
          displayName: true,
          avaUrl: true,
        },
        shop: {
          id: true,
          name: true,
          owner: {
            id: true,
          },
        },
      },
    });
  }

  async findByShop(
    shopId: number,
    query: QueryReviewDto,
  ): Promise<{ reviews: Review[]; total: number; avgRating: number }> {
    const { page = 1, limit = 10, rating } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.shopId = :shopId', { shopId })
      .select(['review', 'user.id', 'user.displayName', 'user.avaUrl'])
      .orderBy('review.createdAt', 'DESC');

    if (rating) {
      queryBuilder.andWhere('review.rating = :rating', { rating });
    }

    const [reviews, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const avgResult = await this.reviewRepo
      .createQueryBuilder('review')
      .where('review.shopId = :shopId', { shopId })
      .select('AVG(review.rating)', 'avg')
      .getRawOne();

    const avgRating = avgResult.avg ? parseFloat(avgResult.avg) : 0;

    return { reviews, total, avgRating };
  }

  async findByUser(userId: number): Promise<Review[]> {
    return await this.reviewRepo.find({
      where: { user: { id: userId } },
      relations: {
        shop: true,
      },
      select: {
        shop: {
          id: true,
          name: true,
          img: true,
          address: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async checkUserReviewed(userId: number, shopId: number): Promise<boolean> {
    const count = await this.reviewRepo.count({
      where: {
        user: { id: userId },
        shop: { id: shopId },
      },
    });
    return count > 0;
  }

  async create(
    userId: number,
    shopId: number,
    rating: number,
    comment: string,
    img?: string[],
  ): Promise<Review> {
    const review = this.reviewRepo.create({
      user: { id: userId },
      shop: { id: shopId },
      rating,
      comment,
      img: img || [], // ✅ Set img
    });
    return await this.reviewRepo.save(review);
  }

  async reply(id: number, ownerReply: string): Promise<Review> {
    await this.reviewRepo.update(id, {
      ownerReply,
      repliedAt: new Date(),
    });
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.reviewRepo.delete(id);
    return result.affected > 0;
  }

  async getShopRatingStats(shopId: number): Promise<{
    avgRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const reviews = await this.reviewRepo.find({
      where: { shop: { id: shopId } },
      select: ['rating'],
    });

    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      ratingDistribution[r.rating]++;
    });

    return {
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews,
      ratingDistribution,
    };
  }
}

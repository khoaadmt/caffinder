import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../entities/favorite.entity';

@Injectable()
export class FavoriteRepository {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepo: Repository<Favorite>,
  ) {}

  async findByUserAndShop(
    userId: number,
    shopId: number,
  ): Promise<Favorite | null> {
    return await this.favoriteRepo.findOne({
      where: {
        user: { id: userId },
        shop: { id: shopId },
      },
    });
  }

  async findAllByUser(userId: number): Promise<Favorite[]> {
    return await this.favoriteRepo.find({
      where: { user: { id: userId } },
      relations: {
        shop: {
          owner: true,
        },
      },
      select: {
        shop: {
          id: true,
          name: true,
          img: true,
          address: true,
          description: true,
          openTime: true,
          closeTime: true,
          status: true,
          owner: {
            id: true,
            displayName: true,
            avaUrl: true,
          },
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async countByShop(shopId: number): Promise<number> {
    return await this.favoriteRepo.count({
      where: { shop: { id: shopId } },
    });
  }

  async create(userId: number, shopId: number): Promise<Favorite> {
    const favorite = this.favoriteRepo.create({
      user: { id: userId },
      shop: { id: shopId },
    });
    return await this.favoriteRepo.save(favorite);
  }

  async delete(userId: number, shopId: number): Promise<boolean> {
    const result = await this.favoriteRepo.delete({
      user: { id: userId },
      shop: { id: shopId },
    });
    return result.affected > 0;
  }

  async isFavorited(userId: number, shopId: number): Promise<boolean> {
    const count = await this.favoriteRepo.count({
      where: {
        user: { id: userId },
        shop: { id: shopId },
      },
    });
    return count > 0;
  }
}

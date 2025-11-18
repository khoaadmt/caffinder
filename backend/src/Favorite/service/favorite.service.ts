import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ShopRepository } from 'src/shops/repository/shops.repository';
import { FavoriteRepository } from '../repositories/favorite.repository';

@Injectable()
export class FavoriteService {
  constructor(
    private readonly favoriteRepository: FavoriteRepository,
    private readonly shopRepository: ShopRepository,
  ) {}

  async addFavorite(userId: number, shopId: number) {
    // Kiểm tra shop có tồn tại không
    const shop = await this.shopRepository.findOneById(shopId);
    if (!shop) {
      throw new NotFoundException('Shop không tồn tại');
    }

    // Kiểm tra đã favorite chưa
    const existing = await this.favoriteRepository.findByUserAndShop(
      userId,
      shopId,
    );
    if (existing) {
      throw new ConflictException('Bạn đã yêu thích shop này rồi');
    }

    // Tạo favorite
    const favorite = await this.favoriteRepository.create(userId, shopId);

    return {
      message: 'Đã thêm vào danh sách yêu thích',
      data: {
        id: favorite.id,
        shopId: shopId,
        createdAt: favorite.createdAt,
      },
    };
  }

  async removeFavorite(userId: number, shopId: number) {
    // Kiểm tra favorite có tồn tại không
    const existing = await this.favoriteRepository.findByUserAndShop(
      userId,
      shopId,
    );
    if (!existing) {
      throw new NotFoundException('Shop không có trong danh sách yêu thích');
    }

    // Xóa favorite
    await this.favoriteRepository.delete(userId, shopId);

    return {
      message: 'Đã xóa khỏi danh sách yêu thích',
    };
  }

  async getMyFavorites(userId: number) {
    const favorites = await this.favoriteRepository.findAllByUser(userId);

    return {
      message: 'Lấy danh sách yêu thích thành công',
      data: favorites.map((fav) => ({
        favoriteId: fav.id,
        shop: fav.shop,
        favoritedAt: fav.createdAt,
      })),
      total: favorites.length,
    };
  }

  async checkIsFavorited(userId: number, shopId: number) {
    const isFavorited = await this.favoriteRepository.isFavorited(
      userId,
      shopId,
    );

    return {
      shopId,
      isFavorited,
    };
  }

  async getFavoriteCount(shopId: number) {
    const count = await this.favoriteRepository.countByShop(shopId);

    return {
      shopId,
      favoriteCount: count,
    };
  }
}

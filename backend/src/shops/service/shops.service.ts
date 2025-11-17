import { Injectable } from '@nestjs/common';
import { ShopRepository } from '../repository/shops.repository';
import { CreateShopDto } from '../dto/create-shops.dto';
import { UpdateShopDto } from '../dto/update-shop.dto';

require('dotenv').config();

@Injectable()
export class ShopService {
  constructor(private readonly shopRepository: ShopRepository) {}

  async findShopById(id: number) {
    const shop = await this.shopRepository.findOneById(id);
    if (!shop) {
      return {
        message: 'shop not found',
      };
    }
    return { shop };
  }

  async getAll(user: any) {
    const shops = await this.shopRepository.findAll(user);
    return {
      shops,
    };
  }

  async updatedShop(shopId: number, updateShopDto: UpdateShopDto) {
    const shopExisting = await this.shopRepository.findOneById(shopId);
    if (!shopExisting) {
      return {
        message: 'shop not found.',
      };
    }
    await this.shopRepository.updateShop(shopId, updateShopDto);
    const newShop = await this.shopRepository.findOneById(shopId);
    return {
      message: 'update shop success.',
      newShop,
    };
  }

  async updatedStatus(shopId: number, status: string) {
    const shopExisting = await this.shopRepository.findOneById(shopId);
    if (!shopExisting) {
      return {
        message: 'shop not found.',
      };
    }

    try {
      await this.shopRepository.updateStatus(shopId, status);
      const newShop = await this.shopRepository.findOneById(shopId);
      return {
        message: 'update shop success.',
        newShop,
      };
    } catch (err) {
      return { message: err.message };
    }
  }

  async createShop(createShopDto: CreateShopDto) {
    try {
      const newshop = await this.shopRepository.create(createShopDto);
      return {
        message: 'create shop success.',
        newShop: newshop,
      };
    } catch (err) {
      return {
        message: 'create shop failed',
      };
    }
  }
}

import { Injectable } from '@nestjs/common';
import { ShopRepository } from '../repository/shops.repository';
import { CreateShopDto } from '../dto/create-shops.dto';
import { UpdateShopDto } from '../dto/update-shop.dto';
import { QueryShopDto } from '../dto/query-shop.dto';
import axios from 'axios';
import * as Bluebird from 'bluebird';
import { Shops } from '../entities/shops.entity';

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

  async getAllShopsByOwnerId(ownerId: number) {
    return;
  }

  async getAllShops(query: QueryShopDto, user: any) {
    let { shops, total } = await this.shopRepository.findAll(query, user);

    // const shopsWithDistance = await Bluebird.map(shops, async (shop) => {
    //   const distance = await this.realDistanceBetween2Points(
    //     query.latitude,
    //     query.longitude,
    //     shop.latitude,
    //     shop.longitude,
    //   );
    //   return { ...shop, distance };
    // });

    if (query.radius) {
      shops = this.getLocationsWithinRadius(
        query.latitude,
        query.longitude,
        query.radius,
        shops,
      );
    }
    //fake data
    const distance = { text: '9.86 km', value: '9860', fake_data: true };

    const shopsWithDistance = shops.map((shop) => {
      return { ...shop, distance };
    });

    return {
      message: 'Lấy danh sách shops thành công',
      data: shopsWithDistance,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 10,
        total,
        totalPages: Math.ceil(total / (query.limit || 10)),
      },
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

  async createShop(createShopDto: CreateShopDto, userId: number) {
    try {
      const newshop = await this.shopRepository.create(createShopDto, userId);
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

  toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  distanceBetween2Points(la1, lo1, la2, lo2) {
    const R = 6371;
    const dLat = this.toRadians(la2 - la1);
    const dLon = this.toRadians(lo2 - lo1);
    const la1ToRad = this.toRadians(la1);
    const la2ToRad = this.toRadians(la2);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(la1ToRad) *
        Math.cos(la2ToRad) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  }
  async realDistanceBetween2Points(la1, lo1, la2, lo2) {
    // console.log(la1, lo1, lo2, la2);
    const origin = `${la1},${lo1}`;
    const destination = `${la2},${lo2}`;
    const vehicle = 'car';
    const apiKey = process.env.API_KEY_GOONG_MAP;

    const url = `https://rsapi.goong.io/Direction?origin=${origin}&destination=${destination}&vehicle=${vehicle}&api_key=${apiKey}`;

    const response = await axios.get(url);

    const result = response.data.routes[0].legs[0].distance;
    return result;
  }
  private getLocationsWithinRadius(
    latitude,
    longitude,
    radius,
    locations: Shops[],
  ) {
    const result = [];
    for (const location of locations) {
      const distance = this.distanceBetween2Points(
        latitude,
        longitude,
        location.latitude,
        location.longitude,
      );
      if (distance + 1 <= radius) {
        result.push(location);
        break;
      }
    }
    return result;
  }
}

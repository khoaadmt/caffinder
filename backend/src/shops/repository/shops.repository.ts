import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shops } from '../entities/shops.entity';
import { CreateShopDto } from '../dto/create-shops.dto';
import { UpdateShopDto } from '../dto/update-shop.dto';

@Injectable()
export class ShopRepository {
  constructor(
    @InjectRepository(Shops)
    private shopRepo: Repository<Shops>,
  ) {}

  async findOneById(id: number): Promise<Shops | null> {
    return await this.shopRepo.findOne({ where: { id } });
  }

  async findAll(user: any) {
    const query = this.shopRepo.createQueryBuilder('shop');

    if (user.role === 'admin') {
      return await query.orderBy('shop.updatedAt', 'DESC').getMany();
    }

    if (user.role === 'owner') {
      return await query
        .where('shop.owner_id = :ownerId', { ownerId: user.id })
        .orderBy('shop.updatedAt', 'DESC')
        .getMany();
    }

    return await query
      .where('shop.status = :status', { status: 'approved' })
      .getMany();
  }

  async updateShop(shopId: number, updateShopDto: UpdateShopDto) {
    return await this.shopRepo.update({ id: shopId }, updateShopDto);
  }

  async updateStatus(shopId: number, status: string) {
    return await this.shopRepo.update({ id: shopId }, { status });
  }

  async create(CreateShopDto: CreateShopDto) {
    const newShop = await this.shopRepo.create(CreateShopDto);

    await this.shopRepo.save(newShop);
    return newShop;
  }
}

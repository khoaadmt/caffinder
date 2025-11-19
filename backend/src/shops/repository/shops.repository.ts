import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shops } from '../entities/shops.entity';
import { CreateShopDto } from '../dto/create-shops.dto';
import { UpdateShopDto } from '../dto/update-shop.dto';
import { User } from 'src/auth/entities/user.entity';
import { QueryShopDto } from '../dto/query-shop.dto';

@Injectable()
export class ShopRepository {
  constructor(
    @InjectRepository(Shops)
    private shopRepo: Repository<Shops>,
  ) {}

  async findOneById(id: number): Promise<Shops | null> {
    return await this.shopRepo.findOne({
      where: { id },
      relations: {
        owner: true,
      },
      select: {
        owner: {
          id: true,
          displayName: true,
          avaUrl: true,
          contactPhone: true,
        },
      },
    });
  }

  async findAll(query: QueryShopDto, user: any) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.shopRepo.createQueryBuilder('shop');

    if (user?.role === 'admin') {
      const [shops, total] = await queryBuilder
        .orderBy('shop.updatedAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return { shops, total };
    }

    if (user?.role === 'owner') {
      const [shops, total] = await queryBuilder
        .where('shop.ownerId = :ownerId', { ownerId: user.id })
        .orderBy('shop.updatedAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return { shops, total };
    }

    const [shops, total] = await queryBuilder
      .where('shop.status = :status', { status: 'approved' })
      .orderBy('shop.updatedAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { shops, total };
  }

  async updateShop(shopId: number, updateShopDto: UpdateShopDto) {
    return await this.shopRepo.update({ id: shopId }, updateShopDto);
  }

  async updateStatus(shopId: number, status: string) {
    return await this.shopRepo.update({ id: shopId }, { status });
  }

  async create(CreateShopDto: CreateShopDto, userId: number) {
    const newShop = this.shopRepo.create({
      ...CreateShopDto,
      owner: { id: userId } as User, // Type cast
    });

    const savedShop = await this.shopRepo.save(newShop);

    // Load lại với relation
    return await this.shopRepo.findOne({
      where: { id: savedShop.id },
      relations: ['owner'],
    });
  }
}

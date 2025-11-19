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
    const { page = 1, limit = 10, status, search, sortBy, order } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.shopRepo
      .createQueryBuilder('shop')
      .leftJoinAndSelect('shop.owner', 'owner')
      .leftJoin('shop.favorites', 'favorites')
      .select([
        'shop.id',
        'shop.name',
        'shop.img',
        'shop.address',
        'shop.description',
        'shop.totalCapacity',
        'shop.openTime',
        'shop.closeTime',
        'shop.latitude',
        'shop.longitude',
        'shop.status',
        'shop.createdAt',
        'shop.updatedAt',
        'owner.id',
        'owner.displayName',
        'owner.avaUrl',
        'owner.contactPhone',
      ])
      .addSelect('COUNT(favorites.id)', 'favorite_count');

    if (user?.role === 'admin') {
    } else if (user?.role === 'owner') {
      queryBuilder.andWhere('shop.ownerId = :ownerId', { ownerId: user.id });
    } else {
      queryBuilder.andWhere('shop.status = :status', { status: 'approved' });
    }

    if (status) {
      queryBuilder.andWhere('shop.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(shop.name ILIKE :search OR shop.address ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.groupBy('shop.id');
    queryBuilder.addGroupBy('owner.id');

    if (sortBy === 'newest') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      queryBuilder.andWhere('shop.updatedAt >= :sevenDaysAgo', {
        sevenDaysAgo,
      });
      queryBuilder.orderBy('shop.updatedAt', 'DESC');
    } else if (sortBy === 'most_favorite') {
      queryBuilder.orderBy('favorite_count', 'DESC');
    } else if (sortBy === 'createdAt') {
      queryBuilder.orderBy('shop.createdAt', order || 'DESC');
    } else {
      queryBuilder.orderBy('shop.updatedAt', 'DESC');
    }

    queryBuilder.skip(skip).take(limit);

    const rawAndEntities = await queryBuilder.getRawAndEntities();
    const total = rawAndEntities.entities.length;

    const shops = rawAndEntities.entities.map((shop, index) => ({
      ...shop,
      favorite_count: parseInt(rawAndEntities.raw[index].favorite_count) || 0,
    }));

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
      owner: { id: userId } as User,
    });

    const savedShop = await this.shopRepo.save(newShop);

    return await this.shopRepo.findOne({
      where: { id: savedShop.id },
      relations: ['owner'],
    });
  }
}

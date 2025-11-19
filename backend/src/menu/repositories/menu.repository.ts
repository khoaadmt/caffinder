import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../entities/menu.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuItemDto } from '../dto/update-menu-item.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';

@Injectable()
export class MenuRepository {
  constructor(
    @InjectRepository(Menu)
    private menuRepo: Repository<Menu>,
    @InjectRepository(MenuItem)
    private menuItemRepo: Repository<MenuItem>,
  ) {}

  async findMenusByShop(shopId: number): Promise<Menu[]> {
    return await this.menuRepo.find({
      where: { shop: { id: shopId } },
      relations: {
        items: true,
      },
      order: {
        displayOrder: 'ASC',
        items: {
          displayOrder: 'ASC',
        },
      },
    });
  }

  async findMenuById(menuId: number): Promise<Menu | null> {
    return await this.menuRepo.findOne({
      where: { id: menuId },
      relations: {
        shop: {
          owner: true,
        },
        items: true,
      },
      select: {
        shop: {
          id: true,
          name: true,
          owner: {
            id: true,
          },
        },
      },
      order: {
        items: {
          displayOrder: 'ASC',
        },
      },
    });
  }

  async createMenu(
    shopId: number,
    createMenuDto: CreateMenuDto,
  ): Promise<Menu> {
    const menu = this.menuRepo.create({
      ...createMenuDto,
      shop: { id: shopId },
    });
    return await this.menuRepo.save(menu);
  }

  async updateMenu(
    menuId: number,
    updateMenuDto: UpdateMenuDto,
  ): Promise<Menu> {
    await this.menuRepo.update(menuId, updateMenuDto);
    return await this.findMenuById(menuId);
  }

  async deleteMenu(menuId: number): Promise<boolean> {
    const result = await this.menuRepo.delete(menuId);
    return result.affected > 0;
  }

  async findMenuItemById(itemId: number): Promise<MenuItem | null> {
    return await this.menuItemRepo.findOne({
      where: { id: itemId },
      relations: {
        menu: {
          shop: {
            owner: true,
          },
        },
      },
      select: {
        menu: {
          id: true,
          name: true,
          shop: {
            id: true,
            name: true,
            owner: {
              id: true,
            },
          },
        },
      },
    });
  }

  async findItemsByMenu(menuId: number): Promise<MenuItem[]> {
    return await this.menuItemRepo.find({
      where: { menu: { id: menuId } },
      order: { displayOrder: 'ASC' },
    });
  }

  async findItemsByCategory(
    shopId: number,
    category: string,
  ): Promise<MenuItem[]> {
    return await this.menuItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.menu', 'menu')
      .where('menu.shopId = :shopId', { shopId })
      .andWhere('item.category = :category', { category })
      .orderBy('item.displayOrder', 'ASC')
      .getMany();
  }

  async createMenuItem(
    menuId: number,
    createMenuItemDto: CreateMenuItemDto,
  ): Promise<MenuItem> {
    const menuItem = this.menuItemRepo.create({
      ...createMenuItemDto,
      menu: { id: menuId },
    });
    return await this.menuItemRepo.save(menuItem);
  }

  async updateMenuItem(
    itemId: number,
    updateMenuItemDto: UpdateMenuItemDto,
  ): Promise<MenuItem> {
    await this.menuItemRepo.update(itemId, updateMenuItemDto);
    return await this.findMenuItemById(itemId);
  }

  async deleteMenuItem(itemId: number): Promise<boolean> {
    const result = await this.menuItemRepo.delete(itemId);
    return result.affected > 0;
  }
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ShopRepository } from 'src/shops/repository/shops.repository';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuItemDto } from '../dto/update-menu-item.dto';
import { MenuRepository } from '../repositories/menu.repository';
import { UpdateMenuDto } from '../dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(
    private readonly menuRepository: MenuRepository,
    private readonly shopRepository: ShopRepository,
  ) {}

  async getShopMenus(shopId: number) {
    const shop = await this.shopRepository.findOneById(shopId);
    if (!shop) {
      throw new NotFoundException('Shop không tồn tại');
    }

    const menus = await this.menuRepository.findMenusByShop(shopId);

    return {
      message: 'Lấy menu thành công',
      data: menus,
      total: menus.length,
    };
  }

  async getMenuDetail(menuId: number) {
    const menu = await this.menuRepository.findMenuById(menuId);
    if (!menu) {
      throw new NotFoundException('Menu không tồn tại');
    }

    return {
      message: 'Lấy chi tiết menu thành công',
      data: menu,
    };
  }

  async createMenu(
    shopId: number,
    ownerId: number,
    createMenuDto: CreateMenuDto,
  ) {
    const shop = await this.shopRepository.findOneById(shopId);
    if (!shop) {
      throw new NotFoundException('Shop không tồn tại');
    }

    if (shop.owner.id !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền tạo menu cho shop này');
    }

    const menu = await this.menuRepository.createMenu(shopId, createMenuDto);

    return {
      message: 'Tạo menu thành công',
      data: menu,
    };
  }

  async updateMenu(
    menuId: number,
    ownerId: number,
    updateMenuDto: UpdateMenuDto,
  ) {
    const menu = await this.menuRepository.findMenuById(menuId);
    if (!menu) {
      throw new NotFoundException('Menu không tồn tại');
    }

    if (menu.shop.owner.id !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật menu này');
    }

    const updatedMenu = await this.menuRepository.updateMenu(
      menuId,
      updateMenuDto,
    );

    return {
      message: 'Cập nhật menu thành công',
      data: updatedMenu,
    };
  }

  async deleteMenu(menuId: number, ownerId: number) {
    const menu = await this.menuRepository.findMenuById(menuId);
    if (!menu) {
      throw new NotFoundException('Menu không tồn tại');
    }

    if (menu.shop.owner.id !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền xóa menu này');
    }

    await this.menuRepository.deleteMenu(menuId);

    return {
      message: 'Xóa menu thành công',
    };
  }

  async getMenuItems(menuId: number) {
    const menu = await this.menuRepository.findMenuById(menuId);
    if (!menu) {
      throw new NotFoundException('Menu không tồn tại');
    }

    const items = await this.menuRepository.findItemsByMenu(menuId);

    return {
      message: 'Lấy danh sách món thành công',
      data: items,
      total: items.length,
    };
  }

  async getItemsByCategory(shopId: number, category: string) {
    const shop = await this.shopRepository.findOneById(shopId);
    if (!shop) {
      throw new NotFoundException('Shop không tồn tại');
    }

    const items = await this.menuRepository.findItemsByCategory(
      shopId,
      category,
    );

    return {
      message: `Lấy danh sách món ${category} thành công`,
      data: items,
      total: items.length,
    };
  }

  async getMenuItemDetail(itemId: number) {
    const item = await this.menuRepository.findMenuItemById(itemId);
    if (!item) {
      throw new NotFoundException('Món không tồn tại');
    }

    return {
      message: 'Lấy chi tiết món thành công',
      data: item,
    };
  }

  async createMenuItem(
    menuId: number,
    ownerId: number,
    createMenuItemDto: CreateMenuItemDto,
  ) {
    const menu = await this.menuRepository.findMenuById(menuId);
    if (!menu) {
      throw new NotFoundException('Menu không tồn tại');
    }

    if (menu.shop.owner.id !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền thêm món vào menu này');
    }

    const menuItem = await this.menuRepository.createMenuItem(
      menuId,
      createMenuItemDto,
    );

    return {
      message: 'Thêm món thành công',
      data: menuItem,
    };
  }

  async updateMenuItem(
    itemId: number,
    ownerId: number,
    updateMenuItemDto: UpdateMenuItemDto,
  ) {
    const item = await this.menuRepository.findMenuItemById(itemId);
    if (!item) {
      throw new NotFoundException('Món không tồn tại');
    }

    if (item.menu.shop.owner.id !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật món này');
    }

    const updatedItem = await this.menuRepository.updateMenuItem(
      itemId,
      updateMenuItemDto,
    );

    return {
      message: 'Cập nhật món thành công',
      data: updatedItem,
    };
  }

  async deleteMenuItem(itemId: number, ownerId: number) {
    const item = await this.menuRepository.findMenuItemById(itemId);
    if (!item) {
      throw new NotFoundException('Món không tồn tại');
    }

    if (item.menu.shop.owner.id !== ownerId) {
      throw new ForbiddenException('Bạn không có quyền xóa món này');
    }

    await this.menuRepository.deleteMenuItem(itemId);

    return {
      message: 'Xóa món thành công',
    };
  }
}

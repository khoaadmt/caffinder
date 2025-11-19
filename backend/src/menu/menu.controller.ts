import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/utils/roles.guard';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuService } from './service/menu.service';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('shop/:shopId')
  async getShopMenus(@Param('shopId', ParseIntPipe) shopId: number) {
    return await this.menuService.getShopMenus(shopId);
  }

  @Get(':menuId')
  async getMenuDetail(@Param('menuId', ParseIntPipe) menuId: number) {
    return await this.menuService.getMenuDetail(menuId);
  }

  @Post('shop/:shopId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  async createMenu(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Body() createMenuDto: CreateMenuDto,
    @Req() req,
  ) {
    const ownerId = req.user.user_id;
    return await this.menuService.createMenu(shopId, ownerId, createMenuDto);
  }

  @Patch(':menuId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  async updateMenu(
    @Param('menuId', ParseIntPipe) menuId: number,
    @Body() updateMenuDto: UpdateMenuDto,
    @Req() req,
  ) {
    const ownerId = req.user.user_id;
    return await this.menuService.updateMenu(menuId, ownerId, updateMenuDto);
  }

  @Delete(':menuId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  async deleteMenu(@Param('menuId', ParseIntPipe) menuId: number, @Req() req) {
    const ownerId = req.user.user_id;
    return await this.menuService.deleteMenu(menuId, ownerId);
  }

  @Get(':menuId/items')
  async getMenuItems(@Param('menuId', ParseIntPipe) menuId: number) {
    return await this.menuService.getMenuItems(menuId);
  }

  @Get('shop/:shopId/category/:category')
  async getItemsByCategory(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('category') category: string,
  ) {
    return await this.menuService.getItemsByCategory(shopId, category);
  }

  @Get('item/:itemId')
  async getMenuItemDetail(@Param('itemId', ParseIntPipe) itemId: number) {
    return await this.menuService.getMenuItemDetail(itemId);
  }

  @Post(':menuId/items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  async createMenuItem(
    @Param('menuId', ParseIntPipe) menuId: number,
    @Body() createMenuItemDto: CreateMenuItemDto,
    @Req() req,
  ) {
    const ownerId = req.user.user_id;
    return await this.menuService.createMenuItem(
      menuId,
      ownerId,
      createMenuItemDto,
    );
  }

  @Patch('item/:itemId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  async updateMenuItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
    @Req() req,
  ) {
    const ownerId = req.user.user_id;
    return await this.menuService.updateMenuItem(
      itemId,
      ownerId,
      updateMenuItemDto,
    );
  }

  @Delete('item/:itemId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  async deleteMenuItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Req() req,
  ) {
    const ownerId = req.user.user_id;
    return await this.menuService.deleteMenuItem(itemId, ownerId);
  }
}

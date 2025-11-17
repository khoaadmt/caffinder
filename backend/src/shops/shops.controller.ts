import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ShopService } from './service/shops.service';
import { CreateShopDto } from './dto/createShops.dto';
import { UpdateShopDto } from './dto/updateShop.dto';

@Controller('shops')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get(':id')
  async getShopById(@Param('id') shopId: number) {
    return await this.shopService.findShopById(shopId);
  }

  @Get('')
  async getAll(@Req() req) {
    return await this.shopService.getAll(req.user);
  }

  @Post('')
  async createShop(@Body() createShopDto: CreateShopDto) {
    return await this.shopService.createShop(createShopDto);
  }

  @Patch(':id')
  async updateShop(
    @Param('id') shopId: number,
    @Body() updateShopDto: UpdateShopDto,
  ) {
    return await this.shopService.updatedShop(shopId, updateShopDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') shopId: number,
    @Body('status') status: string,
  ) {
    return await this.shopService.updatedStatus(shopId, status);
  }
}

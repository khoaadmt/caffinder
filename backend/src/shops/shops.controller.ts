import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ShopService } from './service/shops.service';
import { CreateShopDto } from './dto/create-shops.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { QueryShopDto } from './dto/query-shop.dto';

@Controller('shops')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get(':id')
  async getShopById(@Param('id') shopId: number) {
    return await this.shopService.findShopById(shopId);
  }

  @Get()
  async getAllShops(@Query() query: QueryShopDto, @Req() req) {
    return await this.shopService.getAllShops(query, req.user);
  }

  @Post('')
  @UseGuards(JwtAuthGuard)
  async createShop(@Body() createShopDto: CreateShopDto, @Request() req) {
    return await this.shopService.createShop(createShopDto, req.user.user_id);
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

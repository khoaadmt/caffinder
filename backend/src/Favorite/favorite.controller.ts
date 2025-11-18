import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/utils/roles.guard';
import { FavoriteService } from './service/favorite.service';

@Controller('favorite')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post(':shopId')
  @Roles('user')
  async addFavorite(@Req() req, @Param('shopId', ParseIntPipe) shopId: number) {
    const userId = req.user.user_id;
    return await this.favoriteService.addFavorite(userId, shopId);
  }

  @Delete(':shopId')
  @Roles('user')
  async removeFavorite(
    @Req() req,
    @Param('shopId', ParseIntPipe) shopId: number,
  ) {
    const userId = req.user.user_id;
    return await this.favoriteService.removeFavorite(userId, shopId);
  }

  @Get('my')
  @Roles('user')
  async getMyFavorites(@Req() req) {
    const userId = req.user.user_id;
    return await this.favoriteService.getMyFavorites(userId);
  }

  @Get('check/:shopId')
  @Roles('user')
  async checkIsFavorited(
    @Req() req,
    @Param('shopId', ParseIntPipe) shopId: number,
  ) {
    const userId = req.user.user_id;
    return await this.favoriteService.checkIsFavorited(userId, shopId);
  }

  @Get('count/:shopId')
  async getFavoriteCount(@Param('shopId', ParseIntPipe) shopId: number) {
    return await this.favoriteService.getFavoriteCount(shopId);
  }
}

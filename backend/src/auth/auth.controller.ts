import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';

import { LoginUserDto } from './dto/login.dto';
import { GoogleAuthGuard } from './utils/GoogleAuthGuards';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  login(@Body() loginUser: LoginUserDto, @Res() res: Response) {
    return this.authService.login(loginUser, res);
  }

  @Post('logout')
  logOut() {
    return { data: '123' };
  }

  @Get('/facebook/login')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('/facebook/redirect')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginRedirect(@Req() req, @Res() res): Promise<any> {
    const token = await this.authService.loginWithFacebook(req.user);
    res.redirect(
      `${process.env.FRONT_END_URL}/auth/social/redirect?accessToken=${token.accessToken}&refresh_token=${token.refreshToken}`,
    );
  }

  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  async handleGoogleLogin(@Req() req: Request) {
    return { msg: 'Google Authentication' };
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async GoogleRedirect(@Req() req, @Res() res) {
    const token = await this.authService.loginWithGoogle(req.user);
    res.redirect(
      `${process.env.FRONT_END_URL}/auth/social/redirect?accessToken=${token.accessToken}&refresh_token=${token.refreshToken}`,
    );
  }

  @Post('refresh')
  async refreshToken(@Req() req: Request) {
    const refreshToken = req.cookies.refreshToken;
    return await this.authService.refreshToken(refreshToken);
  }
}

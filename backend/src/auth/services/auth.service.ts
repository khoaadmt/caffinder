import { HttpException, HttpStatus, Injectable, Res } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginUserDto } from '../dto/login.dto';
import type { Request, Response } from 'express';
import { UserRepository } from '../repository/user.repository';
require('dotenv').config();

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async loginWithGoogle(profile_google: any) {
    const displayName = profile_google.displayName;
    const username = profile_google.id;
    const avaUrl = profile_google.photos[0].value;

    let payload = {
      username: username,
      user_id: 0,
      displayName: displayName,
      avaUrl: avaUrl,
      facebookId: '',
      contactPhone: '',
      role: '',
    };

    const user = await this.userRepository.findUserByGoogleType(username);
    if (!user) {
      const newUser = await this.userRepository.createUserByGoogleType(
        username,
        displayName,
        avaUrl,
      );
      payload.user_id = newUser.id;
    } else {
      payload.facebookId = user.facebookId;
      payload.contactPhone = user.contactPhone;
      payload.user_id = user.id;
    }
    const token = await this.genarateToken(payload);
    return token;
  }

  async loginWithFacebook(profile_facebook: any) {
    const displayName =
      profile_facebook._json.last_name +
      ' ' +
      profile_facebook._json.first_name;
    const username = profile_facebook._json.id;

    let payload = {
      username: username,
      user_id: 0,
      displayName: displayName,
      avaUrl: '',
      facebookId: username,
      contactPhone: '',
      role: '',
    };
    const user = await this.userRepository.findUserByFacebookType(username);

    if (!user) {
      const newUser = await this.userRepository.createUserByFacebookType(
        username,
        displayName,
      );
      payload.avaUrl = newUser.avaUrl;
      payload.user_id = newUser.id;
    } else {
      payload.avaUrl = user.avaUrl;
      payload.contactPhone = user.contactPhone;
    }
    const token = await this.genarateToken(payload);
    return token;
  }

  async handleRedirectResponse() {}

  async register(registerUserDto: RegisterUserDto) {
    const user = await this.userRepository.findOneByUsername(
      registerUserDto.username,
    );

    if (user) {
      throw new HttpException('Username already exists', HttpStatus.CONFLICT);
    }
    const hashedPassword = await this.haspassword(registerUserDto.password);

    const newUser = await this.userRepository.createUser({
      ...registerUserDto,
      password: hashedPassword,
    });
    return {
      message: 'Register success.',
      user: {
        id: newUser.id,
        username: newUser.username,
        displayName: newUser.displayName,
        avarUrl: newUser.avaUrl,
        isActive: newUser.isActive,
      },
    };
  }

  async login(loginUserDto: LoginUserDto, @Res() res: Response) {
    const user = await this.userRepository.findOneByUsername(
      loginUserDto.username,
    );

    if (!user) {
      throw new HttpException(
        'User name is not exist',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isMatch = await bcrypt.compare(loginUserDto.password, user.password);
    if (!isMatch) {
      throw new HttpException(
        'Password is not correct',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = {
      username: user.username,
      user_id: user.id,
      displayName: user.displayName,
      avaUrl: user.avaUrl,
      contactPhone: user.contactPhone,
      facebookId: user.facebookId,
      role: user.role,
    };
    const token = await this.genarateToken(payload);

    res.cookie('refreshToken', token.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });

    return res.status(HttpStatus.OK).json({
      accessToken: token.accessToken,
    });
  }

  async refreshToken(refreshToken: string) {
    try {
      const verify = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
      return this.genarateToken({
        username: verify.username,
        user_id: verify.userId,
        displayName: verify.displayName,
        avaUrl: verify.avaUrl,
        contactPhone: verify.contactPhone,
        facebookId: verify.facebookId,
        role: verify.role,
      });
    } catch (err) {
      throw new HttpException(
        err.message + ' -- Refresh token is not valid',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async genarateToken(payload: {
    username: string;
    user_id: number;
    displayName: string;
    avaUrl: string;
    contactPhone: string;
    facebookId: string;
    role: string;
  }) {
    const accessToken =
      'Bearer ' +
      (await this.jwtService.signAsync(payload, {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: '8h',
      }));
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: '7d',
    });

    const existingUser = await this.userRepository.findOneByUsername(
      payload.username,
    );

    if (!existingUser) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User not found',
      };
    }
    await this.userRepository.updateUser(existingUser, {
      accessToken,
      refreshToken,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async haspassword(password: string) {
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }
}

import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class VerifyTokenMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      throw new UnauthorizedException('Token not provided');
    }
    const authHeader = req.headers.authorization.split(' ')[1];
    if (!authHeader) {
      throw new UnauthorizedException('Token not provided');
    }

    const token = authHeader;
    try {
      const verify = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
      req.user = verify;
      next();
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}

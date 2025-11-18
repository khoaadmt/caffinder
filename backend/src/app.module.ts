import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import * as crypto from 'crypto';

if (!globalThis.crypto) {
  (globalThis as any).crypto = crypto;
}

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ShopsModule } from './shops/shops.module';
import { VerifyTokenMiddleware } from './middlewares/logging.middleware';
import { BookingsModule } from './booking/bookings.module';
import { FavoriteModule } from './Favorite/favorite.module';
import { ReviewModule } from './reviews/review.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        return {
          type: 'postgres',
          url: databaseUrl,
          ssl: { rejectUnauthorized: false },
          autoLoadEntities: true,
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),

    AuthModule,
    ShopsModule,
    BookingsModule,
    FavoriteModule,
    ReviewModule,
  ],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(VerifyTokenMiddleware).forRoutes('*path');
  }
}

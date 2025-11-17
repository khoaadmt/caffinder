import { Module } from '@nestjs/common';
import * as crypto from 'crypto';

if (!globalThis.crypto) {
  (globalThis as any).crypto = crypto;
}

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

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
  ],
  providers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { AccountModule } from './modules/account/account.module';
import { TokenBookmarkModule } from './modules/token-bookmark/token-bookmark.module';
import { PnlModule } from './modules/pnl/pnl.module';
import { TradingPlatformModule } from './modules/trading-platform/trading-platform.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    AccountModule,
    TokenBookmarkModule,
    PnlModule,
    TradingPlatformModule,
  ],
})
export class AppModule {}

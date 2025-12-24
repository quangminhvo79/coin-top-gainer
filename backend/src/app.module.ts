import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { AccountModule } from './modules/account/account.module';
import { TokenBookmarkModule } from './modules/token-bookmark/token-bookmark.module';
import { PnlModule } from './modules/pnl/pnl.module';
import { TradingPlatformModule } from './modules/trading-platform/trading-platform.module';
import { FuturesTradingModule } from './modules/futures-trading/futures-trading.module';

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
    ScheduleModule.forRoot(),
    AuthModule,
    AccountModule,
    TokenBookmarkModule,
    PnlModule,
    TradingPlatformModule,
    FuturesTradingModule,
  ],
})
export class AppModule {}

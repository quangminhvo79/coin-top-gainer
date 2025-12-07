import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenBookmarkController } from './token-bookmark.controller';
import { TokenBookmarkService } from './token-bookmark.service';
import { TokenBookmark } from '../../entities/token-bookmark.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TokenBookmark])],
  controllers: [TokenBookmarkController],
  providers: [TokenBookmarkService],
  exports: [TokenBookmarkService],
})
export class TokenBookmarkModule {}

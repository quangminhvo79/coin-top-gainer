import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TokenBookmarkService } from './token-bookmark.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class TokenBookmarkController {
  constructor(private readonly bookmarkService: TokenBookmarkService) {}

  @Post()
  create(@Request() req, @Body() createBookmarkDto: CreateBookmarkDto) {
    return this.bookmarkService.create(req.user.userId, createBookmarkDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.bookmarkService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.bookmarkService.findOne(id, req.user.userId);
  }

  @Get('symbol/:symbol')
  findBySymbol(@Request() req, @Param('symbol') symbol: string) {
    return this.bookmarkService.findBySymbol(symbol, req.user.userId);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateBookmarkDto: UpdateBookmarkDto,
  ) {
    return this.bookmarkService.update(id, req.user.userId, updateBookmarkDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.bookmarkService.remove(id, req.user.userId);
  }

  @Delete('symbol/:symbol')
  removeBySymbol(@Request() req, @Param('symbol') symbol: string) {
    return this.bookmarkService.removeBySymbol(symbol, req.user.userId);
  }
}

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenBookmark } from '../../../entities/token-bookmark.entity';
import { CreateBookmarkDto } from '../dto/create-bookmark.dto';
import { UpdateBookmarkDto } from '../dto/update-bookmark.dto';

@Injectable()
export class TokenBookmarkService {
  constructor(
    @InjectRepository(TokenBookmark)
    private bookmarkRepository: Repository<TokenBookmark>,
  ) {}

  async create(
    userId: string,
    createBookmarkDto: CreateBookmarkDto,
  ): Promise<TokenBookmark> {
    const existing = await this.bookmarkRepository.findOne({
      where: { userId, symbol: createBookmarkDto.symbol },
    });

    if (existing) {
      throw new ConflictException('Bookmark already exists for this token');
    }

    const bookmark = this.bookmarkRepository.create({
      ...createBookmarkDto,
      userId,
    });

    return this.bookmarkRepository.save(bookmark);
  }

  async findAll(userId: string): Promise<TokenBookmark[]> {
    return this.bookmarkRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<TokenBookmark> {
    const bookmark = await this.bookmarkRepository.findOne({
      where: { id, userId },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    return bookmark;
  }

  async findBySymbol(symbol: string, userId: string): Promise<TokenBookmark> {
    const bookmark = await this.bookmarkRepository.findOne({
      where: { symbol, userId },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    return bookmark;
  }

  async update(
    id: string,
    userId: string,
    updateBookmarkDto: UpdateBookmarkDto,
  ): Promise<TokenBookmark> {
    const bookmark = await this.findOne(id, userId);
    Object.assign(bookmark, updateBookmarkDto);
    return this.bookmarkRepository.save(bookmark);
  }

  async remove(id: string, userId: string): Promise<void> {
    const bookmark = await this.findOne(id, userId);
    await this.bookmarkRepository.remove(bookmark);
  }

  async removeBySymbol(symbol: string, userId: string): Promise<void> {
    const bookmark = await this.findBySymbol(symbol, userId);
    await this.bookmarkRepository.remove(bookmark);
  }
}

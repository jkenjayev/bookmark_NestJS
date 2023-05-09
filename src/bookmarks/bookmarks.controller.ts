import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { PrismaService } from '../prisma/prisma.service';
import { BookmarksService } from './bookmarks.service';
import { GetUser } from '../auth/decorator';
import {
  CreateBookmarkDto,
  EditBookmarkDto,
} from './dto';
import { Bookmarks } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarksController {
  constructor(
    private prisma: PrismaService,
    private bookmarkService: BookmarksService,
  ) {}

  @Get()
  getBookmarks(
    @GetUser('id') userId: number,
  ) {
    return this.bookmarkService.getBookmarks(
      userId,
    );
  }

  @Post()
  createBookmark(
    @GetUser('id') userId: number,
    @Body() dto: CreateBookmarkDto,
  ) {
    return this.bookmarkService.createBookmark(
      userId,
      dto,
    );
  }

  @Get(':id')
  getBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe)
    bookmarkId: number,
  ) {
    return this.bookmarkService.getBookmarkById(
      userId,
      bookmarkId,
    );
  }

  @Patch(':id')
  updateBookmarkById(
    @GetUser('id') userId: number,
    @Body() dto: EditBookmarkDto,
    @Param('id', ParseIntPipe)
    bookmarkId: number,
  ): Promise<Bookmarks> {
    return this.bookmarkService.updateBookmarkById(
      userId,
      bookmarkId,
      dto,
    );
  }

  @Delete(':id')
  deleteBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe)
    bookmarkId: number,
  ): Promise<Bookmarks> {
    return this.bookmarkService.deleteBookmarkById(
      userId,
      bookmarkId,
    );
  }
}

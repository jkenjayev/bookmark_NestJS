import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateBookmarkDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { EditBookmarkDto } from './dto/edit-bookmark.dto';
import { Bookmarks } from '@prisma/client';

@Injectable()
export class BookmarksService {
  constructor(private prisma: PrismaService) {
  }

  async getBookmarks(userId: number) {
    const bookmarks: Bookmarks[] = await this.prisma.bookmarks.findMany({
      where: {
        userId,
      },
    });

    return bookmarks;
  }

  createBookmark(userId: number, dto: CreateBookmarkDto) {
    return this.prisma.bookmarks.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  getBookmarkById(userId: number, bookmarkId: number) {
    return this.prisma.bookmarks.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    });
  }

  async updateBookmarkById(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ): Promise<Bookmarks> {
    const bookmark: Bookmarks = await this.prisma.bookmarks.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to recourses denied');
    }

    const updatedBookmark: Bookmarks = await this.prisma.bookmarks.update({
      where: {
        id: bookmarkId,
      },

      data: {
        ...dto,
      },
    });

    console.log(dto);
    return updatedBookmark;
  }

  async deleteBookmarkById(
    userId: number,
    bookmarkId: number,
  ): Promise<Bookmarks> {
    const bookmark:Bookmarks = await this.prisma.bookmarks.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to recourses denied');
    }

    return this.prisma.bookmarks.delete({
      where: {
        id: bookmarkId,
      },
    });
  }
}

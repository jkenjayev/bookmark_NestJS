import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmarks/dto';

describe('Bookmark Project', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
    }));
    prisma = app.get(PrismaService);
    await app.init();
    await app.listen(3000);
    await prisma.cleanDB();
    pactum.request.setBaseUrl('http://localhost:3000');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'test@mail.io',
      password: '123',
    };
    describe('Sign up', () => {
      it('should throw if request is without body', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400);
      });

      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw if email is not valid', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: 'testing',
          })
          .expectStatus(400);
      });

      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Sign in', () => {
      it('should throw if request is without body', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(400);
      });

      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw if email is not valid', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: 'testing',
          })
          .expectStatus(400);
      });

      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('UserAT', 'access_token');
      });
    });

  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: `Bearer $S{UserAT}`,
          })
          .expectStatus(200);
      });

      it('should update user info', () => {
        const dto: EditUserDto = {
          email: 'testing@mail.io',
          firstName: 'javohirboy',
          lastName: 'Kenjayev',
        };
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: `Bearer $S{UserAT}`,
          })
          .withBody(dto)
          .expectStatus(200);
      });
    });
  });
  describe('Bookmark', () => {
    describe('Create Bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'NestJS tutorial',
        link: 'https://youtube.com/c/freecodecamp',
      };
      it('should create new bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: `Bearer $S{UserAT}`,
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should get all bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{UserAT}',
          })
          .expectStatus(200);
      });
    });

    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get(`/bookmarks/{id}`)
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{UserAT}',
          })
          .expectStatus(200);
      });
    });

    describe('Update bookmark by id', () => {
      const dto: EditBookmarkDto = {
        description: "this is the test................."
      };
      it('should update the bookmark by its id', () => {
        return pactum
          .spec()
          .patch(`/bookmarks/{id}`)
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{UserAT}',
          })
          .withBody(dto)
          .expectStatus(200)
      });
    });

    describe("Delete bookmark by id", () => {
      it("Should delete bookmark by id", () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams("id", `$S{bookmarkId}`)
          .withHeaders({
            Authorization: `Bearer $S{UserAT}`
          })
          .expectStatus(200)
          .inspect()
      })
    })
  });
});
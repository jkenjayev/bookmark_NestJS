import { Injectable } from "@nestjs/common";
import { AuthDto } from "./dto";
import * as argon from "argon2";
import { PrismaService } from "src/prisma/prisma.service";
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) { }

  async signup(dto: AuthDto) {
    // generate password hash
    const hash = await argon.hash(dto.password);

    // save the new user into the db
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash
      }
    });

    // return the saved user
    delete user.hash
    return user
  }

  signin(dto: AuthDto) {
    return { msg: "I am signed in" };
  }
}
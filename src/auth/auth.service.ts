import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthDto } from "./dto";
import * as argon from "argon2";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService
  ) { }

  async signup(dto: AuthDto) {
    // generate password hash
    const hash = await argon.hash(dto.password);
    try {
      // save the new user into the db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash
        }
      });

      // return the saved user
      return this.signToken(user.id, user.email);
    } catch (err) {
      if (err.code === "P2002") {
        throw new ForbiddenException("Crediantials taken")
      }

      throw err;
    }
  }

  async signin(dto: AuthDto) {
    // find the user by email
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email
      }
    });

    // if user not found throw new ForbiddenException 
    if (!user) {
      throw new ForbiddenException("Crediantials taken");
    }

    // verify the user is valid password
    const isMatchPwd = await argon.verify(user.hash, dto.password);

    // if password not valid  throw new ForbiddenException 
    if (!isMatchPwd) {
      throw new ForbiddenException("Crediantials taken");
    }

    // user exist return the user
    return this.signToken(user.id, user.email);
  }

  async signToken(userId: number, email: string): Promise<{access_token: string}> {
    const payload = {
      sub: userId,
      email
    }
    const secret = this.config.get("JWT_SECRET");
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret
    })

    return {
      access_token: token
    }
  }
}
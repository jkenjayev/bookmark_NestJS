import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { EditUserDto } from './dto';

@Module({
  controllers: [UserController],
  providers: [UserService, EditUserDto],
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [ConfigModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRepository } from './user.repository';
import { TypeOrmExModule } from 'src/helpers/database/typeorm-ex.module';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([UserRepository]),
  ],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule { }

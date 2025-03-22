import { Module } from '@nestjs/common';
import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';
import { TypeOrmExModule } from 'src/helpers/database/typeorm-ex.module';
import { AdminRepository } from './admin.repository';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([AdminRepository]),
  ],
  controllers: [AdminsController],
  providers: [AdminsService]
})
export class AdminsModule { }

import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './helpers/database/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { AdminsModule } from './admins/admins.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    AuthModule,
    AdminsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

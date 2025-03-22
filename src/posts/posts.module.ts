import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { TypeOrmExModule } from 'src/helpers/database/typeorm-ex.module';
import { PostRepository } from './post.repository';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([PostRepository]),
  ],
  controllers: [PostsController],
  providers: [PostsService]
})
export class PostsModule { }

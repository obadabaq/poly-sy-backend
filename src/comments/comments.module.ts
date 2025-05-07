import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { TypeOrmExModule } from 'src/helpers/database/typeorm-ex.module';
import { PostRepository } from 'src/posts/post.repository';
import { CommentRepository } from './comment.repository';
import { UserRepository } from 'src/users/user.repository';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([CommentRepository, PostRepository, UserRepository]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService]
})
export class CommentsModule { }

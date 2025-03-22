import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { GetUser } from 'src/helpers/decorators/get-user.decorator';
import { CreateCommentDto } from './helpers/create-comment-dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('comments')
export class CommentsController {
    constructor(private commentsService: CommentsService) { }

    @Get('')
    getComments() {
        return this.commentsService.getComments();
    }

    @Post('')
    addComment(@GetUser() user, @Body() createCommentDto: CreateCommentDto) {
        return this.commentsService.addComment(user, createCommentDto);
    }

    @Post('/like/:id')
    likeComment(@GetUser() user, @Param('id', ParseIntPipe) id: number) {
        return this.commentsService.likeComment(user, id);
    }

    @Post('/dislike/:id')
    dislikeComment(@GetUser() user, @Param('id', ParseIntPipe) id: number) {
        return this.commentsService.dislikeComment(user, id);
    }

    @Delete('/:id')
    deleteComment(@GetUser() user, @Param('id', ParseIntPipe) id: number) {
        return this.commentsService.deleteComment(user, id);
    }
}

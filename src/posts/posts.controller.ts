import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/helpers/decorators/get-user.decorator';
import { CreatePostDto } from './helpers/create-post-dto';

@UseGuards(AuthGuard('jwt'))
@Controller('posts')
export class PostsController {
    constructor(private postsService: PostsService) { }

    @Get('')
    getPosts() {
        return this.postsService.getPosts();
    }

    @Get('/:postId/comments')
    getPostComments(@GetUser() user, @Param('postId', ParseIntPipe) postId: number) {
        return this.postsService.getPostComments(user, postId);
    }

    @Post('')
    addPost(@GetUser() user, @Body() createPostDto: CreatePostDto) {
        return this.postsService.addPost(user, createPostDto);
    }

    @Get('/getCouncil/:area/:level')
    getCouncil(@GetUser() user, @Param('area') area: string, @Param('level') level: number) {
        return this.postsService.getCouncil(user, area, level);
    }

    @Get('/getStreet/:area/:level')
    getStreet(@GetUser() user, @Param('area') area: string, @Param('level') level: number) {
        return this.postsService.getStreet(user, area, level);
    }

    @Post('/like/:id')
    likePost(@GetUser() user, @Param('id', ParseIntPipe) id: number) {
        return this.postsService.likePost(user, id);
    }

    @Post('/dislike/:id')
    dislikePost(@GetUser() user, @Param('id', ParseIntPipe) id: number) {
        return this.postsService.dislikePost(user, id);
    }

    @Delete('/:id')
    deletePost(@GetUser() user, @Param('id', ParseIntPipe) id: number) {
        return this.postsService.deletePost(user, id);
    }
}

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import AdminRoleGuard from 'src/helpers/guards/admin.roles.guard';
import { GetUser } from 'src/helpers/decorators/get-user.decorator';
import { UpdateUserDto } from './helpers/update-location-dto';

@UseGuards(AuthGuard('jwt'), AdminRoleGuard())
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('')
    getUsers() {
        return this.usersService.getUsers();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/:userId/posts')
    getUserPosts(@GetUser() user, @Param('userId', ParseIntPipe) userId: number) {
        return this.usersService.getUserPosts(user, userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/:userId/comments')
    getUserComments(@GetUser() user, @Param('userId', ParseIntPipe) userId: number) {
        return this.usersService.getUserComments(user, userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/:userId/check')
    checkUserIsFollowed(@GetUser() user, @Param('userId', ParseIntPipe) userId: number) {
        return this.usersService.checkUserIsFollowed(user, userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('/update')
    updateLocation(@GetUser() user, @Body() updateLocationDto: UpdateUserDto) {
        return this.usersService.updateLocation(user, updateLocationDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('/follow/:userId')
    followUser(@GetUser() user, @Param('userId', ParseIntPipe) userId: number) {
        return this.usersService.followUser(user, userId);
    }

    @Post('/verify/:userId')
    verifyUser(@Param('userId', ParseIntPipe) userId: number) {
        return this.usersService.verifyUser(userId);
    }

    @Delete('/:id')
    deleteUser(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.deleteUser(id);
    }
}

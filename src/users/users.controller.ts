import { Controller, Delete, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import AdminRoleGuard from 'src/admins/helpers/admin.roles.guard';

@UseGuards(AuthGuard('jwt'), AdminRoleGuard())
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get('')
    getUsers() {
        return this.usersService.getUsers();
    }

    @Delete('/:id')
    deleteUser(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.deleteUser(id);
    }
}

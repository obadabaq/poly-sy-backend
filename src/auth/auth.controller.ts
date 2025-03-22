import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/helpers/create-user-dto';
import { LogInUserDto } from 'src/users/helpers/login-user-dto';
import { LogInAdminDto } from 'src/admins/helpers/login-admin-dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('/user/signup')
    userSignup(@Body() createUserDto: CreateUserDto) {
        return this.authService.addUser(createUserDto);
    }

    @Post('/user/login')
    userLogin(@Body() logInUserDto: LogInUserDto) {
        return this.authService.userLogin(logInUserDto);
    }

    @Post('/admin/login')
    adminLogin(@Body() logInAdminDto: LogInAdminDto) {
        return this.authService.adminLogin(logInAdminDto);
    }
}

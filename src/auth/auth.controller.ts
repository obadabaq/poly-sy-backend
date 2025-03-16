import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/helpers/create-user-dto';
import { SignInUserDto } from 'src/users/helpers/login-user-dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('/user/signup')
    userSignup(@Body() createUserDto: CreateUserDto) {
        return this.authService.addUser(createUserDto);
    }

    @Post('/user/login')
    userLogin(@Body() signInUserDto: SignInUserDto) {
        return this.authService.userLogin(signInUserDto);
    }
}

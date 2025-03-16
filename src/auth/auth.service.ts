import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/users/user.repository';
import { PassportStrategy } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';
import { UserJwtPayload } from 'src/users/helpers/user-jwt-payload.interface';
import { User } from 'src/users/user.entity';
import { CreateUserDto, UserRole, UserStatus } from 'src/users/helpers/create-user-dto';
import { SignInUserDto } from 'src/users/helpers/login-user-dto';

@Injectable()
export class AuthService extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        private jwtService: JwtService,

    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'topSecret51'
        });
    }


    async addUser(createUserDto: CreateUserDto): Promise<any> {
        const { phone, password, role } = createUserDto;

        const salt = await bcrypt.genSalt();

        const user = new User();
        user.phone = phone;
        user.password = await this.hashPassword(password, salt);
        user.salt = salt;
        if (Object.values(UserRole).includes(role)) {
            user.role = role;
        }
        else {
            throw new ForbiddenException('User role should be VOTER or REPRESENTATIVE');
        }
        if (user.role == UserRole.REPRESENTATIVE) {
            user.status = UserStatus.WAITING_FOR_APPROVAL
        }
        else {
            user.status = UserStatus.VERIFIED
        }
        const accessToken = await this.userToken(phone);
        user.accessToken = accessToken;

        try {
            await this.userRepository.save(user);
        } catch (e) {
            if (e.code === '23505') {
                throw new ConflictException("Phone already exists");
            }
            throw new InternalServerErrorException("Error code:" + e.code);
        }

        const { password: _, salt: __, ...userWithoutSensitiveData } = user;

        return userWithoutSensitiveData;
    }

    async userLogin(signInUserDto: SignInUserDto) {
        let { phone } = signInUserDto;

        let user = await this.userRepository.validatePassword(signInUserDto);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const accessToken = await this.userToken(phone);
        user.accessToken = accessToken;

        const updatedUser = await this.userRepository.save(user);


        delete updatedUser.password;
        delete updatedUser.salt;

        return updatedUser;
    }

    async validateUser(payload: UserJwtPayload): Promise<User> {

        const { phone } = payload;
        const user = await this.userRepository.findOne({ where: { phone: phone } });

        if (!user) {
            throw new UnauthorizedException();
        }
        return user;

    }

    async validateUserToken(token: string) {
        let customer = this.jwtService.decode(token);
        return customer['phone'];
    }

    async userToken(phone: string): Promise<string> {
        let payload: UserJwtPayload = { phone, } as UserJwtPayload;
        const accessToken = await this.jwtService.sign(payload);
        return accessToken;
    }

    private async hashPassword(password: string, salt: string) {
        return bcrypt.hash(password, salt);
    }

}

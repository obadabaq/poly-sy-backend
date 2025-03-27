import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, OnApplicationBootstrap, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/users/user.repository';
import { PassportStrategy } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';
import { UserJwtPayload } from 'src/users/helpers/user-jwt-payload.interface';
import { User } from 'src/users/user.entity';
import { CreateUserDto, UserRole, UserStatus } from 'src/users/helpers/create-user-dto';
import { LogInUserDto } from 'src/users/helpers/login-user-dto';
import { LogInAdminDto } from 'src/admins/helpers/login-admin-dto';
import { AdminRepository } from 'src/admins/admin.repository';
import { AdminJwtPayload } from 'src/admins/helpers/admin-jwt-payload.interface';
import { Admin } from 'src/admins/admin.entity';

@Injectable()
export class AuthService extends PassportStrategy(Strategy) implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        @InjectRepository(AdminRepository)
        private adminRepository: AdminRepository,
        private jwtService: JwtService,

    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'topSecret51'
        });
    }


    async onApplicationBootstrap() {
        await this.createAdminIfNotExists();
    }

    async validate(payload: any): Promise<any> {
        if (payload.username) {
            const { username } = payload;
            const admin = await this.adminRepository.findOne({ where: { username: username } });

            if (!admin) {
                throw new UnauthorizedException();
            }
            return admin;
        }
        else {
            const { phone } = payload;
            const user = await this.userRepository.findOne({ where: { phone: phone } });

            if (!user) {
                throw new UnauthorizedException();
            }
            return user;
        }
    }

    async addUser(createUserDto: CreateUserDto): Promise<any> {
        const { phone, password, role, lat, long, idVerification } = createUserDto;

        const salt = await bcrypt.genSalt();

        const user = new User();
        user.phone = phone;
        user.password = await this.hashPassword(password, salt);
        user.salt = salt;
        user.numOfFollowers = 0;
        user.numOfFollowing = 0;
        if (!Object.values(UserRole).includes(role)) {
            throw new ForbiddenException('User role should be VOTER or REPRESENTATIVE');
        }
        user.role = role;
        if (user.role == UserRole.REPRESENTATIVE) {
            user.status = UserStatus.WAITING_FOR_APPROVAL
        }
        else {
            user.status = UserStatus.VERIFIED
        }
        user.lat = lat;
        user.long = long;
        const accessToken = await this.userToken(phone);
        user.accessToken = accessToken;
        if (idVerification !== undefined && idVerification !== null) user.idVerification = idVerification;
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

    async userLogin(logInUserDto: LogInUserDto) {
        let { phone } = logInUserDto;

        let user = await this.userRepository.validatePassword(logInUserDto);

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

    async createAdminIfNotExists(): Promise<any> {
        const username = process.env.ADMIN_USERNAME
        const password = process.env.ADMIN_PASSWORD;

        const adminExists = await this.adminRepository.findOne({
            where: { username: username },
        });

        if (!adminExists && username && password) {
            const salt = await bcrypt.genSalt();

            const admin = new Admin();
            admin.username = username;
            admin.password = await this.hashPassword(password, salt);
            admin.salt = salt;
            const accessToken = await this.userToken(username);
            admin.accessToken = accessToken;

            try {
                await this.adminRepository.save(admin);
            } catch (e) {
                if (e.code === '23505') {
                    throw new ConflictException("Phone already exists");
                }
                throw new InternalServerErrorException("Error code:" + e.code);
            }
        }
    }

    async adminLogin(logInAdminDto: LogInAdminDto) {
        let { username } = logInAdminDto;

        let admin = await this.adminRepository.validatePassword(logInAdminDto);

        if (!admin) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const accessToken = await this.adminToken(username);
        admin.accessToken = accessToken;

        const updatedAdmin = await this.adminRepository.save(admin);


        delete updatedAdmin.password;
        delete updatedAdmin.salt;

        return updatedAdmin;
    }

    async userToken(phone: string): Promise<string> {
        let payload: UserJwtPayload = { phone } as UserJwtPayload;
        const accessToken = await this.jwtService.sign(payload);
        return accessToken;
    }

    async adminToken(username: string): Promise<string> {
        let payload: AdminJwtPayload = { username } as AdminJwtPayload;
        const accessToken = await this.jwtService.sign(payload);
        return accessToken;
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

    private async hashPassword(password: string, salt: string) {
        return bcrypt.hash(password, salt);
    }

}

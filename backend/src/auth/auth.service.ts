import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createUserDto } from 'src/users/dto/createUser.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login.user.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) { }

    async register(createUserDto: createUserDto) {
        const { email, password } = createUserDto;
        const existingUser = await this.usersService.findOneByEmail(email);
        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.usersService.create({
            ...createUserDto,
            password: hashedPassword,
        });
        const userObject = user.toObject();
        const { password: userPassword, ...result } = userObject;
        return result;
    }

    async loginUser(loginUserDto: LoginUserDto) {
        const { email, password } = loginUserDto;

        //
        const user = await this.usersService.findOneByEmailWithPassword(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { sub: user._id, email: user.email };
        const accessToken = await this.jwtService.signAsync(payload);
        return {
            message: 'Login successful',
            accessToken,
        };
    }
}

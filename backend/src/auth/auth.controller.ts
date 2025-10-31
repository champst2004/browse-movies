import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { createUserDto } from 'src/users/dto/createUser.dto';
import { LoginUserDto } from './dto/login.user.dto';
import { JwtAuthGuard } from './guard/auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    @Post('signup')
    async register(@Body() createUserDto: createUserDto) {
        return await this.authService.register(createUserDto);
    }

    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto) {
        return await this.authService.loginUser(loginUserDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Req() req) {
        return req.user;
    }
}

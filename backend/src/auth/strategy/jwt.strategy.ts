import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "src/users/models/user.schema";
import { UsersService } from "src/users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
    ) {
        const secret = configService.get<string>('JWT_SECRET')!;

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: { sub: string; email: string }): Promise<Omit<User, 'password'>> {

        const user = await this.usersService.findOneById(payload.sub);
        if (!user) {
            throw new UnauthorizedException('User not found.');
        }
        return user.toObject();
    }
}
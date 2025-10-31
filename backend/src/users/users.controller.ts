import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { MovieDto } from './dto/movie.dto';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get('favorites')
    async getMyFavorites(@Req() req) {
        const userId = req.user.sub;
        return this.usersService.getFavorites(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('favorites/add')
    @HttpCode(HttpStatus.OK)
    async addFavorite(@Req() req, @Body() body: MovieDto) {
        const userId = req.user.sub;
        const { movieId } = body;

        console.log(`Attempting to add favorite for userId: ${userId}`); // <-- ADD THIS

        const updateResult = await this.usersService.addFavorite(userId, movieId);


        console.log('Database update result:', updateResult); // <-- ADD THIS


        if (updateResult.matchedCount === 0) {
            console.error('USER NOT FOUND. No document matched the userId.');
            return { message: 'Error: User not found.' }; // Send a real error
        }

        if (updateResult.modifiedCount === 0) {
            console.warn('Favorite already exists.');
        }

        return { message: 'Favorite added successfully' };
    }


    @UseGuards(JwtAuthGuard)
    @Delete('favorites/remove')
    @HttpCode(HttpStatus.OK)
    async removeFavorite(@Req() req, @Body() body: MovieDto) {
        const userId = req.user.sub;
        const { movieId } = body;
        await this.usersService.removeFavorite(userId, movieId);
        return { message: 'Favorite removed successfully' };
    }
}

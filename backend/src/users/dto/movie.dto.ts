import { IsString, IsNotEmpty } from 'class-validator';

export class MovieDto {
    @IsString()
    @IsNotEmpty()
    movieId: string;
}
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './models/user.schema';
import { Model } from 'mongoose';
import { createUserDto } from './dto/createUser.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>
    ) { }

    async create(createUserDto: createUserDto): Promise<UserDocument> {
        const newUser = new this.userModel(createUserDto);
        return newUser.save();
    }

    async findOneByEmail(email: string): Promise<UserDocument | undefined> {
        const user = await this.userModel.findOne({ email }).exec();
        return user || undefined;
    }

    async findOneByEmailWithPassword(email: string): Promise<UserDocument | undefined> {
        const user = await this.userModel.findOne({ email }).select('+password').exec();
        return user || undefined;
    }


    async findOneById(id: string): Promise<UserDocument | undefined> {
        const user = await this.userModel.findById(id).exec();
        return user || undefined;
    }

    async addFavorite(userId: string, movieId: string) {
        return this.userModel.updateOne(
            { _id: userId },
            { $addToSet: { favoriteMovies: movieId } }
        );
    }

    async removeFavorite(userId: string, movieId: string) {
        return this.userModel.updateOne(
            { _id: userId },
            { $pull: { favoriteMovies: movieId } }
        );
    }

    async getFavorites(userId: string) {
        const user = await this.userModel.findById(userId).select('favoriteMovies').exec();
        if (!user) {
            return [];
        }
        return user.favoriteMovies;
    }
}

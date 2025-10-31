import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";

export type UserDocument = mongoose.HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
    @Prop({ unique: true, required: true })
    username: string;

    @Prop({ required: true })
    firstName: string;

    @Prop()
    lastName?: string;

    @Prop({ unique: true, required: true, trim: true })
    email: string;

    @Prop({ required: true, select: false })
    password: string;

    @Prop({ type: String, enum: ['user', 'admin'], default: 'user' })
    role: string;

    @Prop({ type: [String], default: [] })
    favoriteMovies: string[];

}

export const UserSchema = SchemaFactory.createForClass(User);
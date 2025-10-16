import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class User {
    @Prop({ unique: true, required: true })
    username: string;

    @Prop({ required: true })
    firstName: string;

    @Prop()
    lastName?: string;

    @Prop({ unique: true, required: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ type: String, enum: ['user', 'admin'], default: 'user' })
    role: string;

}

export const UserSchema = SchemaFactory.createForClass(User);
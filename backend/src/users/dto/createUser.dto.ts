import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class createUserDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(50, { message: "Username cannot exceed 50 characters" })
    username: string;

    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsNotEmpty({ message: "Email field cannot be empty" })
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(5, { message: "Password must have a minimum length of 5 characters" })
    @MaxLength(20, { message: "Password must have a maximum length of 20 characters" })
    password: string;
}
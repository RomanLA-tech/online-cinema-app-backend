import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class AuthDto {
	@IsEmail({ message: 'Incorrect email' }) email: string;
	@IsString()
	@MinLength(6, { message: 'Min length is 6 symbols' })
	@MaxLength(40, { message: 'Max length is 40 symbols' })
	password: string;
}

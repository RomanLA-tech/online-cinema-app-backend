import {
	IsEmail,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator';

export class UpdateProfileInfoDto {
	@IsOptional() @IsEmail() email?: string | null;

	@IsOptional()
	@IsString()
	@MinLength(6, { message: 'Min. password length is 6 symbols' })
	@MaxLength(40, { message: 'Max. password length is 40 symbols' })
	password?: string;

	@IsOptional()
	@IsString()
	@MinLength(1, { message: 'Min. username length is 1 symbols' })
	@MaxLength(36, { message: 'Max. username length is 36 symbols' })
	username?: string;
}

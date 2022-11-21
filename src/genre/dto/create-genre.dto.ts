import { IsLowercase, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateGenreDto {
	@IsString() @MinLength(1) @MaxLength(30) title: string;

	@MinLength(1) @MaxLength(30) @IsLowercase() @IsString() slug: string;

	@IsString() @MaxLength(250) description: string;

	@IsString() icon: string;
}

import { IsLowercase, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateGenreDto {
	@IsOptional() @IsString() @MinLength(1) @MaxLength(30) title?: string;

	@IsOptional() @IsString() @MinLength(1) @MaxLength(30) @IsLowercase() slug?: string;

	@IsOptional() @IsString() @MaxLength(250) description?: string;

	@IsOptional() @IsString() icon?: string;
}

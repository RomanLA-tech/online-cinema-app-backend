import { IsArray, IsBoolean, IsLowercase, IsObject, IsOptional, IsString } from 'class-validator';
import { MovieParameters } from './create-movie.dto';

export class UpdateMovieDto {
	@IsOptional() @IsString() title: string;

	@IsOptional() @IsString() @IsLowercase() slug: string;

	@IsOptional() @IsString() description: string;

	@IsOptional() @IsArray() @IsString({ each: true }) genres: string[];

	@IsOptional() @IsArray() @IsString({ each: true }) actors: string[];

	@IsOptional() @IsObject() parameters: MovieParameters;

	@IsOptional() @IsBoolean() isSendToTelegram?: boolean;
}

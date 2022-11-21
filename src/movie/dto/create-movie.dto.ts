import {
	IsArray,
	IsBoolean,
	IsLowercase,
	IsNumber,
	IsObject,
	IsOptional,
	IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class MovieParameters {
	@IsNumber() year: number;

	@IsString() country: string;
}

export class CreateMovieDto {
	@IsString() title: string;

	@IsString() @IsLowercase() slug: string;

	@IsString() description: string;

	@IsOptional() @IsArray() @IsString({ each: true }) genres: Types.ObjectId[];

	@IsOptional() @IsArray() @IsString({ each: true }) actors: Types.ObjectId[];

	@IsObject() parameters?: MovieParameters;

	@IsOptional() @IsBoolean() isSendToTelegram?: boolean;
}

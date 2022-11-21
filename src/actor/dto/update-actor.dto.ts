import { IsLowercase, IsOptional, IsString } from 'class-validator';

export class UpdateActorDto {
	@IsOptional() @IsString() name: string;

	@IsOptional() @IsString() @IsLowercase() slug: string;
}

import { IsLowercase, IsString } from 'class-validator';

export class CreateActorDto {
	@IsString() name: string;

	@IsString() @IsLowercase() slug: string;
}

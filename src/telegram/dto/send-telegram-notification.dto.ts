import { IsOptional, IsString } from 'class-validator';

export class SendTelegramNotificationDto {
	@IsString() photoUrl: string;
	@IsOptional() @IsString() caption?: string;
	@IsString() message: string;
}
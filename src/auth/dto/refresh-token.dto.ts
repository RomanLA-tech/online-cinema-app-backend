import { IsJWT } from 'class-validator';

export class RefreshTokenDto {
	@IsJWT({ message: "You didn't pass refresh token or it's not a string" })
	refreshToken: string;
}

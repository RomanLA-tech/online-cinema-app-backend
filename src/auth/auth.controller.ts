import { Body, Controller, HttpCode, Post, UsePipes, ValidationPipe } from '@nestjs/common';

import { AuthDto } from '@/auth/dto/auth.dto';
import { RefreshTokenDto } from '@/auth/dto/refresh-token.dto';
import { AuthService } from '@/auth/auth.service';
import { AUTH_PREFIX, GET_TOKEN, LOGIN, REGISTER } from '@constants';

@Controller(AUTH_PREFIX)
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post(REGISTER)
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	async register(@Body() dto: AuthDto) {
		return await this.authService.register(dto);
	}

	@Post(LOGIN)
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	async login(@Body() dto: AuthDto) {
		return await this.authService.login(dto);
	}

	@Post(GET_TOKEN)
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	async getNewTokens(@Body() dto: RefreshTokenDto) {
		return await this.authService.getNewTokens(dto);
	}
}

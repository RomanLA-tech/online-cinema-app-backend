import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IAuthResponseData, ITokens, IUserData } from '@/auth/interfaces/auth.interface';
import { comparePasswords, encodePassword } from '@/utils/bcrypt';
import { User, UserDocument } from '@/user/schemas/user.schema';
import { AuthDto } from '@/auth/dto/auth.dto';
import { RefreshTokenDto } from '@/auth/dto/refresh-token.dto';
import { ALREADY_EXIST, INVALID_CREDENTIALS, NOT_FOUND, UNAUTHORIZED } from '@constants';

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService
	) {}

	async register(dto: AuthDto): Promise<IAuthResponseData> {
		const userWithThatEmail = await this.findUserByEmail(dto);
		if (!!userWithThatEmail) {
			throw new BadRequestException(ALREADY_EXIST, `User with email: ${dto.email} already exist`);
		}
		const password = await encodePassword(dto.password);
		const newUser = await new this.userModel({
			email: dto.email,
			password,
		}).save();
		const [userData, tokens] = await Promise.all([
			this.returnSelectedUserFields(newUser),
			this.getTokensPair(String(newUser._id)),
		]);
		return { user: userData, ...tokens };
	}

	async login(dto: AuthDto): Promise<IAuthResponseData> {
		const user = await this.validateUser(dto);
		const [tokens, userData] = await Promise.all([
			this.getTokensPair(String(user._id)),
			this.returnSelectedUserFields(user),
		]);
		return { user: userData, ...tokens };
	}

	async getNewTokens({ refreshToken }: RefreshTokenDto): Promise<IAuthResponseData> {
		if (!refreshToken) {
			throw new UnauthorizedException(UNAUTHORIZED, 'Please sign in!');
		}
		const { id } = await this.getUserIdFromToken(refreshToken);
		const user = await this.userModel.findById(id);
		if (!user) {
			throw new UnauthorizedException(INVALID_CREDENTIALS, 'Wrong user credentials');
		}
		const [tokens, userData] = await Promise.all([
			this.getTokensPair(String(user._id)),
			this.returnSelectedUserFields(user),
		]);
		return { user: userData, ...tokens };
	}

	///////////////////////Private methods///////////////////////

	private async findUserByEmail(dto: AuthDto): Promise<UserDocument> {
		const user = await this.userModel.findOne({
			email: dto.email,
		});
		if (!user) {
			throw new NotFoundException(NOT_FOUND, `User with email: ${dto.email} is not found`);
		}
		return user;
	}

	private async validateUser(dto: AuthDto): Promise<UserDocument> {
		const user = await this.findUserByEmail(dto);
		const isValidPassword = await comparePasswords(dto.password, user.password);
		if (!isValidPassword) {
			throw new UnauthorizedException(INVALID_CREDENTIALS, 'Invalid password');
		}
		return user;
	}

	private async getTokensPair(_id: string): Promise<ITokens> {
		const data = { _id };
		const [refreshToken, accessToken] = await Promise.all([
			this.jwtService.signAsync(data, {
				expiresIn: this.configService.get('JWT_REFRESH_EXP'),
			}),
			this.jwtService.signAsync(data, {
				expiresIn: this.configService.get('JWT_ACCESS_EXP'),
			}),
		]);
		return { refreshToken, accessToken };
	}

	private async returnSelectedUserFields(user: UserDocument): Promise<IUserData> {
		return {
			id: String(user._id),
			email: user.email,
			isAdmin: user.isAdmin,
		};
	}

	private async getUserIdFromToken(refreshToken: string): Promise<{ id: string }> {
		try {
			const tokenData = await this.jwtService.verifyAsync(refreshToken);
			return { id: tokenData._id };
		} catch (e) {
			throw new UnauthorizedException(INVALID_CREDENTIALS, 'Invalid token or expired!');
		}
	}
}

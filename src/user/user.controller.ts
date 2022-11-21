import {
	Body,
	CacheInterceptor,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Put,
	Query,
	UseInterceptors,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';

import { Auth } from '@/decorators/auth.decorator';
import { User } from '@/decorators/user.decorator';
import { IdValidationPipe } from '@/pipes/IdValidation.pipe';
import { UserService } from '@/user/user.service';
import { UserDocument } from '@/user/schemas/user.schema';
import { UpdateProfileInfoDto } from '@/user/dto/update-user.dto';
import { Types } from 'mongoose';
import {
	ADMIN,
	FAVORITES,
	GET_COUNT,
	ID,
	ID_TERM,
	PROFILE,
	SEARCH_TERM,
	TOGGLE_ADMIN_STATUS_BY_ID,
	USERS_PREFIX,
} from '@constants';
import { MovieDocument } from '@/movie/schemas/movie.schema';

@Controller(USERS_PREFIX)
@UseInterceptors(CacheInterceptor)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get(PROFILE)
	@Auth()
	async getCurrentProfile(@User('_id') userId: Types.ObjectId): Promise<Partial<UserDocument>> {
		return this.userService.getUserById(userId);
	}

	@Get(ID_TERM)
	@Auth(ADMIN)
	async getUserProfile(
		@Param(ID, IdValidationPipe) userId: Types.ObjectId
	): Promise<Partial<UserDocument>> {
		return this.userService.getUserById(userId);
	}

	@Get()
	@Auth(ADMIN)
	async getAllUsers(@Query(SEARCH_TERM) searchTerm?: string): Promise<Partial<UserDocument>[]> {
		return this.userService.getAllUsers(searchTerm);
	}

	@Get(GET_COUNT)
	@Auth(ADMIN)
	async getUsersCount(): Promise<number> {
		return this.userService.getUsersCount();
	}

	@Get(FAVORITES)
	@Auth()
	async getFavorites(@User('_id') userId: Types.ObjectId): Promise<MovieDocument[]> {
		return this.userService.getFavoritesMovies(userId);
	}

	@Put(FAVORITES)
	@Auth()
	async toggleFavorite(
		@Body(ID, IdValidationPipe) movieId: Types.ObjectId,
		@User('_id') userId: Types.ObjectId
	): Promise<MovieDocument[]> {
		return this.userService.toggleFavorite(movieId, userId);
	}

	@Patch(PROFILE)
	@Auth()
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	async updateCurrentProfileInfo(
		@User('_id') userId: Types.ObjectId,
		@Body() dto: UpdateProfileInfoDto
	): Promise<Partial<UserDocument>> {
		return this.userService.updateProfileInfo(userId, dto);
	}

	@Patch(ID_TERM)
	@Auth(ADMIN)
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	async updateUserInfo(
		@Param(ID, IdValidationPipe) userId: Types.ObjectId,
		@Body() dto: UpdateProfileInfoDto
	): Promise<Partial<UserDocument>> {
		return this.userService.updateProfileInfo(userId, dto);
	}

	@Patch(TOGGLE_ADMIN_STATUS_BY_ID)
	@Auth(ADMIN)
	@HttpCode(200)
	async toggleAdminStatus(@Param(ID, IdValidationPipe) userId: Types.ObjectId): Promise<boolean> {
		return this.userService.toggleAdminStatus(userId);
	}

	@Delete(ID_TERM)
	@Auth(ADMIN)
	@HttpCode(200)
	async deleteUser(@Param(ID, IdValidationPipe) userId: Types.ObjectId): Promise<UserDocument> {
		return this.userService.deleteUser(userId);
	}
}

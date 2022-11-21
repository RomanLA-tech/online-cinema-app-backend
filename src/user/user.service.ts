import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { encodePassword } from '@/utils/bcrypt';
import { User, UserDocument } from '@/user/schemas/user.schema';
import { UpdateProfileInfoDto } from '@/user/dto/update-user.dto';
import { ALREADY_EXIST, BAD_REQUEST, NOT_FOUND } from '@constants';
import { MovieDocument } from '@/movie/schemas/movie.schema';

@Injectable()
export class UserService {
	constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

	async getUserById(userId: Types.ObjectId): Promise<UserDocument> {
		const user = await this.userModel.findById(userId);
		if (!user) {
			throw new NotFoundException(NOT_FOUND, `User with id ${userId} not found`);
		}
		return user;
	}

	async updateProfileInfo(
		userId: Types.ObjectId,
		dto: UpdateProfileInfoDto
	): Promise<Partial<UserDocument>> {
		const user = await this.getUserById(userId);
		const isSameUser = await this.userModel.findOne({ email: dto.email });
		if (isSameUser && String(userId) !== String(isSameUser._id)) {
			throw new BadRequestException(ALREADY_EXIST, `Email: ${dto.email} is already registered`);
		}
		user.email = dto.email;
		if (dto.password) {
			user.password = await encodePassword(dto.password);
		}
		if (dto.username) {
			user.username = dto.username;
		}
		await user.save();
		return {
			email: user.email,
			username: user.username,
			isAdmin: user.isAdmin,
		};
	}

	async getUsersCount(): Promise<number> {
		const count = await this.userModel.find().count().exec();
		if (!count) {
			throw new NotFoundException(NOT_FOUND, `Can't get count`);
		}
		return count;
	}

	async deleteUser(userId): Promise<UserDocument> {
		return this.userModel.findOneAndDelete(userId);
	}

	async getAllUsers(searchTerm?: string): Promise<Partial<UserDocument>[]> {
		let options = {
			$or: [{ email: new RegExp(searchTerm, 'i') }, { username: new RegExp(searchTerm, 'i') }],
		};
		const users = await this.userModel
			.find(options)
			.select('username email isAdmin favorites createdAt')
			.sort({ createdAt: 'desc' })
			.exec();
		if (!users) {
			throw new BadRequestException(BAD_REQUEST, `Search by that criteria is impossible`);
		}
		return users;
	}

	async getFavoritesMovies(userId: Types.ObjectId): Promise<MovieDocument[]> {
		const favorites = await this.userModel
			.findById(userId, 'favorites')
			.populate({ path: 'favorites', populate: { path: 'genres' } })
			.exec()
			.then(data => data.favorites);
		if (!favorites) {
			throw new BadRequestException(BAD_REQUEST, `Can't get favorites movies`);
		}
		return favorites;
	}

	async toggleAdminStatus(userId: Types.ObjectId): Promise<boolean> {
		const user = await this.getUserById(userId);
		user.isAdmin = !user.isAdmin;
		await user.save();
		return user.isAdmin;
	}

	async toggleFavorite(movieId, userId: Types.ObjectId): Promise<MovieDocument[]> {
		const user = await this.userModel.findById(userId);
		if (!user) {
			throw new NotFoundException(NOT_FOUND, `User with id ${userId} not found`);
		}
		user.favorites = user.favorites.includes(movieId)
			? user.favorites.filter(id => String(id) !== String(movieId))
			: [...user.favorites, movieId];
		user.save();
		return user.favorites;
	}
}

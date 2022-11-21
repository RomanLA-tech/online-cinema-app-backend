import {
	BadGatewayException,
	BadRequestException,
	Injectable,
	NotFoundException,
	RequestTimeoutException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Genre, GenreDocument } from '@/genre/schemas/genre.schema';
import { CreateGenreDto } from '@/genre/dto/create-genre.dto';
import { UpdateGenreDto } from '@/genre/dto/update-genre.dto';
import { MovieService } from '@/movie/movie.service';
import { ICollection } from '@/genre/interfaces/collection.interface';
import { ALREADY_EXIST, BAD_REQUEST, NOT_FOUND } from '@constants';

@Injectable()
export class GenreService {
	constructor(
		@InjectModel(Genre.name) private readonly genreModel: Model<GenreDocument>,
		private readonly movieService: MovieService
	) {}

	async getGenreById(genreId: Types.ObjectId): Promise<GenreDocument> {
		return await this.findGenreById(genreId);
	}

	async getGenreBySlug(slug: string): Promise<Partial<GenreDocument>> {
		const genre = await this.findGenreBySlug(slug);
		return {
			title: genre.title,
			slug: genre.slug,
			description: genre.description,
			icon: genre.icon,
		};
	}

	async getAllGenres(searchTerm?: string): Promise<Partial<GenreDocument>[]> {
		try {
			let options = {};
			if (searchTerm) {
				options = {
					$or: [
						{ title: new RegExp(searchTerm, 'i') },
						{ slug: new RegExp(searchTerm, 'i') },
						{ description: new RegExp(searchTerm, 'i') },
					],
				};
			}
			return await this.genreModel
				.find(options)
				.select('title slug description icon createdAt')
				.sort({ createdAt: 'desc' })
				.exec();
		} catch (e) {
			throw new BadGatewayException(e.message);
		}
	}

	async getCollections() {
		const genres = await this.getAllGenres();
		const collections = await Promise.all(
			genres.map(async genre => {
				const movieByGenre = await this.movieService.getMoviesByGenres([genre._id]);
				const result: ICollection = {
					_id: String(genre._id),
					image: movieByGenre[0]?.bigPosterFile?.url,
					slug: genre.slug,
					title: genre.title,
				};
				return result;
			})
		);
		return collections;
	}

	async createNewGenre(dto: CreateGenreDto): Promise<Partial<GenreDocument>> {
		const isGenreNameAlreadyExist = await this.findGenreByTitle(dto.title);
		const isGenreSlugAlreadyExist = await this.findGenreBySlug(dto.slug);
		if (isGenreNameAlreadyExist) {
			throw new BadRequestException(
				ALREADY_EXIST,
				`Genre with title: "${dto.title}" is already exist`
			);
		}
		if (isGenreSlugAlreadyExist) {
			throw new BadRequestException(
				ALREADY_EXIST,
				`Genre with slug: "${dto.slug}" is already exist`
			);
		}
		const newGenre = await new this.genreModel({
			...dto,
		});
		if (!newGenre) {
			throw new RequestTimeoutException(BAD_REQUEST, `Can't create a new genre`);
		}
		await newGenre.save();
		return {
			id: newGenre._id,
			...dto,
		};
	}

	async updateGenreInfo(genreId: Types.ObjectId, dto: UpdateGenreDto): Promise<GenreDocument> {
		const genre = await this.findGenreById(genreId);
		if (dto.slug) {
			const isGenreSlugAlreadyExist = await this.findGenreBySlug(dto.slug);
			if (isGenreSlugAlreadyExist && genre.slug !== dto.slug) {
				throw new BadRequestException(
					ALREADY_EXIST,
					`Genre with slug: "${dto.slug}" is already exist`
				);
			}
			genre.slug = dto.slug;
		}
		if (dto.title) {
			const isGenreNameAlreadyExist = await this.findGenreByTitle(dto.title);
			if (isGenreNameAlreadyExist && genre.title !== dto.title) {
				throw new BadRequestException(
					ALREADY_EXIST,
					`Genre with title: "${dto.title}" is already exist`
				);
			}
			genre.title = dto.title;
		}
		if (dto.description) {
			genre.description = dto.description;
		}
		if (dto.icon) {
			genre.icon = dto.icon;
		}
		return genre.save();
	}

	async deleteGenre(genreId: Types.ObjectId): Promise<GenreDocument> {
		return this.genreModel.findByIdAndDelete(genreId);
	}

	///////////////////////Private methods///////////////////////

	private async findGenreById(genreId: Types.ObjectId) {
		const genre = this.genreModel.findById(genreId);
		if (!genre) {
			throw new NotFoundException(NOT_FOUND, `Genre with ID: ${genreId} not found`);
		}
		return genre;
	}

	private async findGenreBySlug(slug) {
		const genre = this.genreModel.findOne({ slug });
		if (!genre) {
			throw new NotFoundException(NOT_FOUND, `Genre with slug: ${slug} not found`);
		}
		return genre;
	}

	private async findGenreByTitle(title) {
		const genre = this.genreModel.findOne({ title });
		if (!genre) {
			throw new NotFoundException(NOT_FOUND, `Genre with title: ${title} not found`);
		}
		return genre;
	}
}

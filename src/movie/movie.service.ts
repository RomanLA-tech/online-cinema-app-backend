import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { FileService } from '@/file/file.service';
import { CreateMovieDto } from '@/movie/dto/create-movie.dto';
import { UpdateMovieDto } from '@/movie/dto/update-movie.dto';
import { Movie, MovieDocument } from '@/movie/schemas/movie.schema';
import {
	ALREADY_EXIST,
	BAD_REQUEST,
	DEVELOPMENT,
	MOVIES,
	NOT_FOUND,
	POSTERS,
	POSTERS_MIN,
} from '@constants';
import { TelegramService } from '@/telegram/telegram.service';

@Injectable()
export class MovieService {
	constructor(
		@InjectModel(Movie.name) private readonly movieModel: Model<MovieDocument>,
		private readonly fileService: FileService,
		private readonly telegramService: TelegramService
	) {}

	async getMovieById(movieId: Types.ObjectId): Promise<MovieDocument> {
		return await this.findMovieById(movieId);
	}

	async getMovieBySlug(slug: string): Promise<Partial<MovieDocument>> {
		const movie = await this.movieModel.findOne({ slug }).populate('actors genres').exec();
		if (!movie) {
			throw new NotFoundException(NOT_FOUND, `Movie with slug: ${slug} is not found`);
		}
		return movie;
	}

	async getMoviesByActor(actorId: Types.ObjectId): Promise<Partial<MovieDocument>[]> {
		const movies = await this.movieModel.find({ actors: actorId }).exec();
		if (!movies) {
			throw new NotFoundException(NOT_FOUND, `Movies with actor Id: ${actorId} is not found`);
		}
		return movies;
	}

	async getMoviesByGenres(genreIds: Types.ObjectId[]): Promise<Partial<MovieDocument>[]> {
		const movies = await this.movieModel.find({ genres: { $in: genreIds } }).exec();
		if (!movies) {
			throw new NotFoundException(NOT_FOUND, `Movie with actor Id: ${genreIds} is not found`);
		}
		return movies;
	}

	async getMostPopularMovies(): Promise<MovieDocument[]> {
		const mostPopularMovies = await this.movieModel
			.find({ countOpened: { $gt: 0 } })
			.sort({ countOpened: -1 })
			.populate('genres')
			.exec();
		if (!mostPopularMovies) {
			throw new NotFoundException(NOT_FOUND, `Movies  not found`);
		}
		return mostPopularMovies;
	}

	async getAllMovies(searchTerm?: string): Promise<Partial<MovieDocument>[]> {
		let options = {};
		if (searchTerm) {
			options = {
				$or: [{ title: new RegExp(searchTerm, 'i') }],
			};
		}
		const movies = await this.movieModel
			.find(options)
			.select('title slug createdAt rating')
			.sort({ createdAt: 'desc' })
			.populate('actors genres')
			.exec();
		if (!movies) {
			throw new BadRequestException(BAD_REQUEST, `Can't get movies`);
		}
		return movies;
	}

	async updateCountOpened(slug: string): Promise<number> {
		const updatedMovie = await this.movieModel
			.findOneAndUpdate({ slug }, { $inc: { countOpened: 1 } }, { new: true })
			.exec();
		if (!updatedMovie) {
			throw new NotFoundException(`Movie not found`);
		}
		return updatedMovie.countOpened;
	}

	async updateRating(movieId: Types.ObjectId, newRating: number) {
		return this.movieModel
			.findByIdAndUpdate(
				movieId,
				{
					rating: newRating,
				},
				{ new: true }
			)
			.exec();
	}

	async createNewMovie(dto: CreateMovieDto): Promise<MovieDocument> {
		const isMovieSlugAlreadyExist = await this.findMovieBySlug(dto.slug);
		if (isMovieSlugAlreadyExist) {
			throw new BadRequestException(
				ALREADY_EXIST,
				`Movie with slug: "${dto.slug}" is already exist`
			);
		}
		const newMovie = await new this.movieModel({
			...dto,
		});
		if (!newMovie) {
			throw new BadRequestException(BAD_REQUEST, `Can't create a new movie`);
		}
		return await newMovie.save();
	}

	async updateMovieInfo(videoId: Types.ObjectId, dto: UpdateMovieDto): Promise<MovieDocument> {
		if (!dto.isSendToTelegram) {
			await this.sendNotification(dto);
			dto.isSendToTelegram = true;
		}
		if (dto.slug) {
			const isMovieSlugAlreadyExist = await this.findMovieBySlug(dto.slug);
			if (isMovieSlugAlreadyExist) {
				throw new BadRequestException(
					ALREADY_EXIST,
					`Movie with slug: "${dto.slug}" is already exist`
				);
			}
		}
		const updatedMovie = await this.movieModel
			.findByIdAndUpdate(videoId, dto, {
				new: true,
			})
			.exec();
		if (!updatedMovie) {
			throw new NotFoundException(NOT_FOUND, `Movie not found`);
		}
		return updatedMovie;
	}

	async uploadMovieVideoFile(movieId: Types.ObjectId, movieBuffer: Buffer, filename: string) {
		const movie = await this.findMovieById(movieId);
		if (movie.movieVideoFile) {
			await this.deleteMovieFile(movie);
		}
		const movieFile = await this.fileService.uploadPublicFile(movieBuffer, filename, MOVIES);
		const [movieVideoFile, durationTime] = await Promise.all([
			movieFile,
			this.getVideoDuration(movieBuffer),
		]);
		movie.movieVideoFile = await movieVideoFile;
		movie.duration = await durationTime;
		return await movie.save();
	}

	async updateMoviePosters(
		movieId: Types.ObjectId,
		fileBufferMin: Buffer,
		fileBufferBig: Buffer,
		filenameMin: string,
		filenameBig: string
	): Promise<MovieDocument> {
		const movie = await this.findMovieById(movieId);
		const [smallPosterFile, bigPosterFile] = await Promise.all([
			this.fileService.uploadPublicFile(fileBufferMin, filenameMin, POSTERS_MIN),
			this.fileService.uploadPublicFile(fileBufferBig, filenameBig, POSTERS),
		]);
		movie.smallPosterFile = smallPosterFile;
		movie.bigPosterFile = bigPosterFile;
		return movie.save();
	}

	async deleteMoviePosters(movieId: Types.ObjectId): Promise<MovieDocument> {
		const movie = await this.findMovieById(movieId);
		return await this.deleteMoviePostersFiles(movie);
	}

	async deleteMovie(movieId: Types.ObjectId): Promise<MovieDocument> {
		const deletedMovie = await this.findMovieById(movieId);
		if (deletedMovie.smallPosterFile) {
			await this.deleteMoviePostersFiles(deletedMovie);
		}
		if (deletedMovie.movieVideoFile) {
			await this.deleteMovieFile(deletedMovie);
		}
		return deletedMovie.delete();
	}

	async deleteMovieVideoFile(movieId: Types.ObjectId): Promise<MovieDocument> {
		const movie = await this.findMovieById(movieId);
		return await this.deleteMovieFile(movie);
	}

	///////////////////////Private methods///////////////////////

	private async findMovieById(videoId: Types.ObjectId): Promise<MovieDocument> {
		const movie = await this.movieModel.findById(videoId);
		if (!movie) {
			throw new NotFoundException(NOT_FOUND, `Movie with id: ${videoId} is not found`);
		}
		return movie;
	}

	private async findMovieBySlug(slug: string): Promise<MovieDocument> {
		const movie = await this.movieModel.findOne({ slug });
		if (!movie) {
			throw new NotFoundException(NOT_FOUND, `Posters are not found`);
		}
		return movie;
	}

	private async deleteMoviePostersFiles(movie): Promise<MovieDocument> {
		if (!movie.smallPosterFile) {
			throw new NotFoundException(NOT_FOUND, `Posters are not found`);
		}
		return await Promise.all([
			this.fileService.deletePublicFile(movie.smallPosterFile._id),
			this.fileService.deletePublicFile(movie.bigPosterFile._id),
		]).then(() => {
			movie.smallPosterFile = null;
			movie.bigPosterFile = null;
			return movie.save();
		});
	}

	private async deleteMovieFile(movie): Promise<MovieDocument> {
		if (!movie.movieVideoFile) {
			throw new NotFoundException(NOT_FOUND, `Movie is not found`);
		}
		await this.fileService.deletePublicFile(movie.movieVideoFile._id);
		movie.movieVideoFile = null;
		movie.duration = 0;
		return movie.save();
	}

	private async getVideoDuration(movieBuffer: Buffer): Promise<number> {
		try {
			const start = movieBuffer.indexOf(Buffer.from('mvhd')) + 17;
			const timeScale = movieBuffer.readUInt32BE(start);
			const fileDuration = movieBuffer.readUInt32BE(start + 4);
			return Math.floor(fileDuration / timeScale);
		} catch (e) {
			throw `Error from getVideoDuration: ${e.message}`;
		}
	}

	private async sendNotification(dto: UpdateMovieDto) {
		if (process.env.NODE_ENV !== DEVELOPMENT) {
			const msg = `<b>${dto.title}</b>`;
			await this.telegramService.sendMessage(msg, {
				reply_markup: {
					inline_keyboard: [
						[
							{
								url: 'https://google.com',
								text: 'Go to watch',
							},
						],
					],
				},
			});
		}
	}
}

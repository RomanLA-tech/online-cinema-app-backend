import {
	Body,
	CacheInterceptor,
	Controller,
	Delete,
	FileTypeValidator,
	Get,
	HttpCode,
	Param,
	ParseFilePipe,
	Patch,
	Post,
	Put,
	Query,
	UploadedFile,
	UseInterceptors,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { FastifyFileInterceptor } from 'nest-fastify-multer';

import { MovieService } from '@/movie/movie.service';
import { MovieDocument } from '@/movie/schemas/movie.schema';
import { CreateMovieDto } from '@/movie/dto/create-movie.dto';
import { UpdateMovieDto } from '@/movie/dto/update-movie.dto';
import { Auth } from '@/decorators/auth.decorator';
import { IdValidationPipe } from '@/pipes/IdValidation.pipe';
import { imageToWebpWithMiniaturePipe, IMoviePosters } from '@/pipes/imageToWebpWithMiniature.pipe';
import {
	ACTOR_BY_ID,
	ADMIN,
	BY_GENRE,
	BY_SLUG,
	ID,
	ID_TERM,
	MOST_POPULAR,
	MOVIES_PREFIX,
	POSTER_BY_ID,
	POSTER_FIELD_NAME,
	SEARCH_TERM,
	SLUG,
	UPDATE_OPEN_COUNT,
	VALID_IMAGES_TYPES,
	VALID_VIDEO_TYPES,
	VIDEO_BY_ID,
	VIDEO_FIELD_NAME,
} from '@constants';

@Controller(MOVIES_PREFIX)
@UseInterceptors(CacheInterceptor)
export class MovieController {
	constructor(private readonly movieService: MovieService) {}

	@Get()
	async getAllMovies(@Query(SEARCH_TERM) searchTerm?: string): Promise<Partial<MovieDocument>[]> {
		return this.movieService.getAllMovies(searchTerm);
	}

	@Get(MOST_POPULAR)
	async getMostPopularMovies(): Promise<MovieDocument[]> {
		return this.movieService.getMostPopularMovies();
	}

	@Get(ACTOR_BY_ID)
	async getMoviesByActor(
		@Param(ID, IdValidationPipe) actorId: Types.ObjectId
	): Promise<Partial<MovieDocument>[]> {
		return this.movieService.getMoviesByActor(actorId);
	}

	@Get(BY_SLUG)
	async getMovieBySlug(@Param(SLUG) slug: string): Promise<Partial<MovieDocument>> {
		return this.movieService.getMovieBySlug(slug);
	}

	@Get(ID_TERM)
	@Auth(ADMIN)
	async getGetMovieById(
		@Param(ID, IdValidationPipe) movieId: Types.ObjectId
	): Promise<MovieDocument> {
		return this.movieService.getMovieById(movieId);
	}

	@Post(BY_GENRE)
	@HttpCode(200)
	async getMoviesByGenres(@Body(ID) genreIds: Types.ObjectId[]): Promise<Partial<MovieDocument>[]> {
		return this.movieService.getMoviesByGenres(genreIds);
	}

	@Post()
	@Auth(ADMIN)
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	async createNewMovie(@Body() dto: CreateMovieDto): Promise<Partial<MovieDocument>> {
		return this.movieService.createNewMovie(dto);
	}

	@Post(POSTER_BY_ID)
	@Auth(ADMIN)
	@UsePipes(new ValidationPipe())
	@UseInterceptors()
	@FastifyFileInterceptor(POSTER_FIELD_NAME, 1)
	@HttpCode(200)
	async updateMoviePosters(
		@Param(ID, IdValidationPipe) movieId: Types.ObjectId,
		@UploadedFile(
			new ParseFilePipe({
				validators: [new FileTypeValidator({ fileType: VALID_IMAGES_TYPES })],
			}),
			imageToWebpWithMiniaturePipe
		)
		file: IMoviePosters
	): Promise<MovieDocument> {
		return this.movieService.updateMoviePosters(
			movieId,
			file.bufferMin,
			file.buffer,
			file.originalnameMin,
			file.originalname
		);
	}

	@Post(VIDEO_BY_ID)
	@Auth(ADMIN)
	@UsePipes(new ValidationPipe())
	@UseInterceptors()
	@FastifyFileInterceptor(VIDEO_FIELD_NAME, 1)
	@HttpCode(200)
	async updateMovieVideo(
		@Param(ID, IdValidationPipe) movieId: Types.ObjectId,
		@UploadedFile(
			new ParseFilePipe({
				validators: [new FileTypeValidator({ fileType: VALID_VIDEO_TYPES })],
			})
		)
		file: Express.Multer.File
	): Promise<MovieDocument> {
		return this.movieService.uploadMovieVideoFile(movieId, file.buffer, file.originalname);
	}

	@Put(UPDATE_OPEN_COUNT)
	@HttpCode(200)
	async updateCountOpened(@Body(SLUG) slug: string): Promise<number> {
		return this.movieService.updateCountOpened(slug);
	}

	@Patch(ID_TERM)
	@Auth(ADMIN)
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	async updateMovieInfo(
		@Param(ID, IdValidationPipe) movieId: Types.ObjectId,
		@Body() dto: UpdateMovieDto
	): Promise<MovieDocument> {
		return this.movieService.updateMovieInfo(movieId, dto);
	}

	@Delete(ID_TERM)
	@Auth(ADMIN)
	@HttpCode(200)
	async deleteMovie(@Param(ID, IdValidationPipe) movieId: Types.ObjectId): Promise<MovieDocument> {
		return this.movieService.deleteMovie(movieId);
	}

	@Delete(POSTER_BY_ID)
	@Auth(ADMIN)
	@HttpCode(200)
	async deleteMoviePosters(
		@Param(ID, IdValidationPipe) movieId: Types.ObjectId
	): Promise<MovieDocument> {
		return this.movieService.deleteMoviePosters(movieId);
	}

	@Delete(VIDEO_BY_ID)
	@Auth(ADMIN)
	@HttpCode(200)
	async deleteMovieVideoFile(
		@Param(ID, IdValidationPipe) movieId: Types.ObjectId
	): Promise<MovieDocument> {
		return this.movieService.deleteMovieVideoFile(movieId);
	}
}

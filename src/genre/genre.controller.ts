import {
	Body,
	CacheInterceptor,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	Query,
	UseInterceptors,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';

import { GenreService } from '@/genre/genre.service';
import { Auth } from '@/decorators/auth.decorator';
import { IdValidationPipe } from '@/pipes/IdValidation.pipe';
import { GenreDocument } from '@/genre/schemas/genre.schema';
import { UpdateGenreDto } from '@/genre/dto/update-genre.dto';
import { CreateGenreDto } from '@/genre/dto/create-genre.dto';
import { Types } from 'mongoose';
import {
	ADMIN,
	BY_SLUG,
	COLLECTIONS,
	GENRES_PREFIX,
	ID,
	ID_TERM,
	SEARCH_TERM,
	SLUG,
} from '@/common/constants';

@Controller(GENRES_PREFIX)
@UseInterceptors(CacheInterceptor)
export class GenreController {
	constructor(private readonly genreService: GenreService) {}

	@Get()
	async getAllGenres(@Query(SEARCH_TERM) searchTerm?: string): Promise<Partial<GenreDocument>[]> {
		return this.genreService.getAllGenres(searchTerm);
	}

	@Get(BY_SLUG)
	async getGenreBySlug(@Param(SLUG) slug: string): Promise<Partial<GenreDocument>> {
		return this.genreService.getGenreBySlug(slug);
	}

	@Get(COLLECTIONS)
	async getCollections() {
		return this.genreService.getCollections();
	}

	@Get(ID_TERM)
	@Auth(ADMIN)
	async getGetGenreById(@Param(ID, IdValidationPipe) id: Types.ObjectId): Promise<GenreDocument> {
		return this.genreService.getGenreById(id);
	}

	@Post()
	@Auth(ADMIN)
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	async createNewGenre(@Body() dto: CreateGenreDto): Promise<Partial<GenreDocument>> {
		return this.genreService.createNewGenre(dto);
	}

	@Patch(ID_TERM)
	@Auth(ADMIN)
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	async updateGenreInfo(
		@Param(ID, IdValidationPipe) id: Types.ObjectId,
		@Body() dto: UpdateGenreDto
	): Promise<Partial<GenreDocument>> {
		return this.genreService.updateGenreInfo(id, dto);
	}

	@Delete(ID_TERM)
	@Auth(ADMIN)
	@HttpCode(200)
	async deleteGenre(@Param(ID, IdValidationPipe) id: Types.ObjectId): Promise<GenreDocument> {
		return this.genreService.deleteGenre(id);
	}
}

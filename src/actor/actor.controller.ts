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
	Query,
	UploadedFile,
	UseInterceptors,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { FastifyFileInterceptor } from 'nest-fastify-multer';

import { ActorService } from '@/actor/actor.service';
import { ActorDocument } from '@/actor/schemas/actor.schema';
import { CreateActorDto } from '@/actor/dto/create-actor.dto';
import { UpdateActorDto } from '@/actor/dto/update-actor.dto';
import { Auth } from '@/decorators/auth.decorator';
import { ImageToWebpPipe } from '@/pipes/ImageToWebp.pipe';
import { IdValidationPipe } from '@/pipes/IdValidation.pipe';
import {
	ACTORS_PREFIX,
	ADMIN,
	BY_ID,
	BY_PHOTO_ID,
	BY_SLUG,
	ID,
	ID_TERM,
	PHOTO_FIELD_NAME,
	SEARCH_TERM,
	SLUG,
	VALID_IMAGES_TYPES,
} from '@constants';

@Controller(ACTORS_PREFIX)
@UseInterceptors(CacheInterceptor)
export class ActorController {
	constructor(private readonly actorService: ActorService) {}

	@Get()
	async getAllActors(@Query(SEARCH_TERM) searchTerm?: string): Promise<Partial<ActorDocument>[]> {
		return this.actorService.getAllActors(searchTerm);
	}

	@Get(BY_SLUG)
	async getActorBySlug(@Param(SLUG) slug: string): Promise<Partial<ActorDocument>> {
		return this.actorService.getActorBySlug(slug);
	}

	@Get(BY_ID)
	@Auth(ADMIN)
	async getGetActorById(
		@Param(ID, IdValidationPipe) actorId: Types.ObjectId
	): Promise<ActorDocument> {
		return this.actorService.getActorById(actorId);
	}

	@Post()
	@Auth(ADMIN)
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	async createNewActor(@Body() dto: CreateActorDto): Promise<Partial<ActorDocument>> {
		return this.actorService.createNewActor(dto);
	}

	@Post(BY_PHOTO_ID)
	@Auth(ADMIN)
	@UsePipes(new ValidationPipe())
	@UseInterceptors()
	@FastifyFileInterceptor(PHOTO_FIELD_NAME, 1)
	@HttpCode(200)
	async updateActorPhoto(
		@Param(ID, IdValidationPipe) actorId: Types.ObjectId,
		@UploadedFile(
			new ParseFilePipe({
				validators: [new FileTypeValidator({ fileType: VALID_IMAGES_TYPES })],
			}),
			ImageToWebpPipe
		)
		file: Express.Multer.File
	): Promise<ActorDocument> {
		return this.actorService.updateActorPhoto(actorId, file.buffer, file.originalname);
	}

	@Patch(ID_TERM)
	@Auth(ADMIN)
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	async updateActorInfo(
		@Param(ID, IdValidationPipe) actorId: Types.ObjectId,
		@Body() dto: UpdateActorDto
	): Promise<ActorDocument> {
		return this.actorService.updateActorInfo(actorId, dto);
	}

	@Delete(ID_TERM)
	@Auth(ADMIN)
	@HttpCode(200)
	async deleteActor(@Param(ID, IdValidationPipe) actorId: Types.ObjectId): Promise<ActorDocument> {
		return this.actorService.deleteActor(actorId);
	}

	@Delete(BY_PHOTO_ID)
	@Auth(ADMIN)
	@HttpCode(200)
	async deleteActorPhoto(
		@Param(ID, IdValidationPipe) actorId: Types.ObjectId
	): Promise<ActorDocument> {
		return this.actorService.deleteActorPhoto(actorId);
	}
}

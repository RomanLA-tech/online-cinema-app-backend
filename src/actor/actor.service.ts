import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Actor, ActorDocument } from '@/actor/schemas/actor.schema';
import { CreateActorDto } from '@/actor/dto/create-actor.dto';
import { UpdateActorDto } from '@/actor/dto/update-actor.dto';
import { FileService } from '@/file/file.service';
import { ALREADY_EXIST, BAD_REQUEST, NOT_FOUND, PHOTOS } from '@constants';

@Injectable()
export class ActorService {
	constructor(
		@InjectModel(Actor.name) private readonly actorModel: Model<ActorDocument>,
		private readonly fileService: FileService
	) {}

	async getActorById(actorId: Types.ObjectId): Promise<ActorDocument> {
		return await this.findActorById(actorId);
	}

	async getActorBySlug(slug: string): Promise<Partial<ActorDocument>> {
		const actor = await this.findActorBySlug(slug);
		return {
			name: actor.name,
			slug: actor.slug,
			photo: actor.photo,
		};
	}

	async getAllActors(searchTerm?: string): Promise<Partial<ActorDocument>[]> {
		let options = {};
		if (searchTerm) {
			options = {
				$or: [{ name: new RegExp(searchTerm, 'i') }, { slug: new RegExp(searchTerm, 'i') }],
			};
		}
		const actors = await this.actorModel
			.aggregate()
			.match(options)
			.lookup({
				from: 'movies',
				foreignField: 'actors',
				localField: '_id',
				as: 'movies',
			})
			.addFields({ countMovies: { $size: '$movies' } })
			.project({ __v: 0, updatedAt: 0, movies: 0 })
			.sort({ createdAt: -1 })
			.exec();
		if (!actors) {
			throw new BadRequestException(BAD_REQUEST, `Can't get actors`);
		}
		return actors;
	}

	async createNewActor(dto: CreateActorDto): Promise<Partial<ActorDocument>> {
		const isActorSlugAlreadyExist = await this.findActorBySlug(dto.slug);
		if (isActorSlugAlreadyExist) {
			throw new BadRequestException(ALREADY_EXIST, `Actor with slug: ${dto.slug} already exist`);
		}
		const newActor = await new this.actorModel({
			...dto,
		}).save();
		return { id: newActor._id, ...dto };
	}

	async updateActorInfo(actorId: Types.ObjectId, dto: UpdateActorDto): Promise<ActorDocument> {
		const actor = await this.findActorById(actorId);
		if (dto.name) {
			actor.name = dto.name;
		}
		if (dto.slug) {
			const slugAlreadyExist = await this.findActorBySlug(dto.slug);
			if (slugAlreadyExist && actor.slug !== dto.slug) {
				throw new BadRequestException(ALREADY_EXIST, `Slug ${dto.slug} already exist`);
			}
			actor.slug = dto.slug;
		}
		return await actor.save();
	}

	async deleteActorPhoto(actorId: Types.ObjectId): Promise<ActorDocument> {
		const actor = await this.getActorById(actorId);
		if (!actor.photo) {
			throw new NotFoundException(NOT_FOUND, 'Photo not found');
		}
		await this.fileService.deletePublicFile(actor.photo._id);
		actor.photo = null;
		return await actor.save();
	}

	async updateActorPhoto(
		actorId: Types.ObjectId,
		fileBuffer: Buffer,
		filename: string
	): Promise<ActorDocument> {
		const actor = await this.findActorById(actorId);
		if (actor.photo) {
			await this.deleteActorPhoto(actor.photo._id);
		}
		actor.photo = await this.fileService.uploadPublicFile(fileBuffer, filename, PHOTOS);
		return await actor.save();
	}

	async deleteActor(actorId: Types.ObjectId): Promise<ActorDocument> {
		const deletedActor = await this.findActorById(actorId);
		if (deletedActor.photo) {
			await this.deleteActorPhoto(actorId);
		}
		return deletedActor.delete();
	}

	///////////////////////Private methods///////////////////////

	private async findActorById(actorId: Types.ObjectId): Promise<ActorDocument> {
		const actor = await this.actorModel.findById(actorId);
		if (!actor) {
			throw new NotFoundException(NOT_FOUND, `Actor with id: ${actorId} not found`);
		}
		return actor;
	}

	private async findActorBySlug(slug): Promise<ActorDocument> {
		const actor = await this.actorModel.findOne({ slug });
		if (!actor) {
			throw new NotFoundException(NOT_FOUND, `Actor with slug: ${slug} not found`);
		}
		return actor;
	}
}

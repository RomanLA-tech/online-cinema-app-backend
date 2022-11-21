import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

import { PublicFileDocument, PublicFileSchema } from '@/file/schemas/file.schema';
import { MovieParameters } from '../dto/create-movie.dto';
import { Actor } from '@/actor/schemas/actor.schema';
import { Genre } from '@/genre/schemas/genre.schema';

export type MovieDocument = HydratedDocument<Movie>;

@Schema({ timestamps: true })
export class Movie {
	@Prop() title: string;

	@Prop({ unique: true }) slug: string;

	@Prop() description: string;

	@Prop() duration?: number;

	@Prop() parameters?: MovieParameters;

	@Prop({ default: 4.0 }) rating: number;

	@Prop({ default: 0 }) countOpened: number;

	@Prop({ type: [{ type: SchemaTypes.ObjectId }] }) genres?: Genre[];

	@Prop({ type: [{ type: SchemaTypes.ObjectId }] }) actors?: Actor[];

	@Prop({ default: false }) isSendToTelegram: boolean;

	@Prop({ type: PublicFileSchema, default: null }) smallPosterFile?: PublicFileDocument;

	@Prop({ type: PublicFileSchema, default: null }) bigPosterFile?: PublicFileDocument;

	@Prop({ type: PublicFileSchema, default: null }) movieVideoFile?: PublicFileDocument;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);

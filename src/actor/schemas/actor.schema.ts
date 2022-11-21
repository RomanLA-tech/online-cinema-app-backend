import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { PublicFileDocument, PublicFileSchema } from '@/file/schemas/file.schema';

export type ActorDocument = HydratedDocument<Actor>;

@Schema({ timestamps: true })
export class Actor {
	@Prop() name: string;

	@Prop({ unique: true }) slug: string;

	@Prop({ type: PublicFileSchema, default: null }) photo?: PublicFileDocument;
}

export const ActorSchema = SchemaFactory.createForClass(Actor);

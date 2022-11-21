import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PublicFileDocument = HydratedDocument<PublicFile>;

@Schema({ timestamps: true })
export class PublicFile {
	@Prop() url: string;

	@Prop() key: string;
}

export const PublicFileSchema = SchemaFactory.createForClass(PublicFile);

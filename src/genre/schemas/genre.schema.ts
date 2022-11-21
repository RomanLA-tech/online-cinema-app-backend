import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { DEFAULT_GENRE_ICON } from '@/common/constants';

export type GenreDocument = HydratedDocument<Genre>;

@Schema({ timestamps: true })
export class Genre {
	@Prop({ unique: true }) title: string;

	@Prop({ unique: true }) slug: string;

	@Prop() description: string;

	@Prop({ default: DEFAULT_GENRE_ICON }) icon: string;
}

export const GenreSchema = SchemaFactory.createForClass(Genre);

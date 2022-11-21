import { HydratedDocument, SchemaTypes } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '@/user/schemas/user.schema';
import { Movie } from '@/movie/schemas/movie.schema';

export type RatingDocument = HydratedDocument<Rating>;

@Schema({ timestamps: true })
export class Rating {
	@Prop() value: number;

	@Prop({ type: SchemaTypes.ObjectId, ref: User.name }) userId: User;

	@Prop({ type: SchemaTypes.ObjectId, ref: Movie.name }) movieId: Movie;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { Movie, MovieDocument } from '@/movie/schemas/movie.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
	@Prop() username: string;

	@Prop({ unique: true }) email: string;

	@Prop() password: string;

	@Prop({ default: false }) isAdmin: boolean;

	@Prop({ type: [{ type: SchemaTypes.ObjectId }], ref: Movie.name }) favorites: MovieDocument[];
}

export const UserSchema = SchemaFactory.createForClass(User);

import { Types } from 'mongoose';
import { IsObjectId } from 'class-validator-mongo-object-id';
import { IsNumber, Max, Min } from 'class-validator';

export class SetRatingDto {
	@IsObjectId({ message: 'Invalid ID' }) movieId: Types.ObjectId;

	@IsNumber() @Min(1) @Max(5) value: number;
}

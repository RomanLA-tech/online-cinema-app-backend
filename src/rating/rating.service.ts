import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Rating, RatingDocument } from './schemas/rating.schema';
import { MovieService } from '@/movie/movie.service';
import { SetRatingDto } from './dto/set-rating.dto';
import { BAD_REQUEST } from '@constants';

@Injectable()
export class RatingService {
	constructor(
		@InjectModel(Rating.name) private readonly ratingModel: Model<RatingDocument>,
		private readonly movieService: MovieService
	) {}

	async getMovieValueByUser(movieId: Types.ObjectId, userId: Types.ObjectId): Promise<number> {
		return this.ratingModel
			.findOne({ movieId, userId })
			.select('value')
			.exec()
			.then(data => (data ? data.value : 0));
	}

	async setRating(userId: Types.ObjectId, dto: SetRatingDto) {
		const { movieId, value } = dto;
		const newRating = await this.ratingModel
			.findOneAndUpdate(
				{ movieId, userId },
				{ movieId, userId, value },
				{
					new: true,
					upsert: true,
					setDefaultsOnInsert: true,
				}
			)
			.exec();
		const averageRating = await this.averageRatingByMovie(movieId);
		await this.movieService.updateRating(movieId, averageRating);
		return newRating;
	}

	private async averageRatingByMovie(movieId: Types.ObjectId) {
		const ratingsMovie: RatingDocument[] = await this.ratingModel
			.aggregate()
			.match({
				movieId: new Types.ObjectId(movieId),
			})
			.exec();
		const result = ratingsMovie.reduce((acc, item) => acc + item.value, 0) / ratingsMovie.length;
		if (!result) {
			throw new InternalServerErrorException(BAD_REQUEST, 'Something went wrong');
		}
		return result;
	}
}

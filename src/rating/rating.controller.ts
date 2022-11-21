import {
	Body,
	CacheInterceptor,
	Controller,
	Get,
	HttpCode,
	Param,
	Post,
	UseInterceptors,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { Auth } from '@/decorators/auth.decorator';
import { IdValidationPipe } from '@/pipes/IdValidation.pipe';
import { Types } from 'mongoose';
import { User } from '@/decorators/user.decorator';
import { SetRatingDto } from './dto/set-rating.dto';
import { ID, ID_TERM, RATINGS_PREFIX, SET_RATING } from '@constants';

@Controller(RATINGS_PREFIX)
@UseInterceptors(CacheInterceptor)
export class RatingController {
	constructor(private readonly ratingService: RatingService) {}

	@Get(ID_TERM)
	@Auth()
	async getMovieValueByUser(
		@Param(ID, IdValidationPipe) movieId: Types.ObjectId,
		@User('_id') userId: Types.ObjectId
	) {
		return this.ratingService.getMovieValueByUser(movieId, userId);
	}

	@Post(SET_RATING)
	@Auth()
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	async setRating(@User('_id') userId: Types.ObjectId, @Body() dto: SetRatingDto) {
		return this.ratingService.setRating(userId, dto);
	}
}

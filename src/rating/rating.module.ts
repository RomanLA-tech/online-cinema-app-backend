import { CacheModule, Module } from '@nestjs/common';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Rating, RatingSchema } from './schemas/rating.schema';
import { MovieModule } from '@/movie/movie.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Rating.name,
				schema: RatingSchema,
			},
		]),
		MovieModule,
		CacheModule.register(),
	],
	controllers: [RatingController],
	providers: [RatingService],
})
export class RatingModule {}

import { CacheModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FileModule } from '@/file/file.module';
import { Movie, MovieSchema } from '@/movie/schemas/movie.schema';
import { MovieController } from '@/movie/movie.controller';
import { MovieService } from '@/movie/movie.service';
import { TelegramModule } from '@/telegram/telegram.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Movie.name,
				schema: MovieSchema,
			},
		]),
		FileModule,
		TelegramModule,
		CacheModule.register(),
	],
	controllers: [MovieController],
	providers: [MovieService],
	exports: [MovieService],
})
export class MovieModule {}

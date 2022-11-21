import { CacheModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Genre, GenreSchema } from '@/genre/schemas/genre.schema';
import { GenreController } from '@/genre/genre.controller';
import { GenreService } from '@/genre/genre.service';
import { MovieModule } from '@/movie/movie.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Genre.name,
				schema: GenreSchema,
			},
		]),
		CacheModule.register(),
		MovieModule,
	],
	controllers: [GenreController],
	providers: [GenreService],
})
export class GenreModule {}

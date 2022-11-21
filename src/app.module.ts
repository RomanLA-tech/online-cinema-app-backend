import { APP_FILTER } from '@nestjs/core';
import { CacheModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { getMongoDbConfig } from '@/config/mongo.config';
import { GenreModule } from '@/genre/genre.module';
import { UserModule } from '@/user/user.module';
import { AuthModule } from '@/auth/auth.module';
import { FileModule } from '@/file/file.module';
import { ActorModule } from '@/actor/actor.module';
import { MovieModule } from '@/movie/movie.module';
import { TelegramModule } from '@/telegram/telegram.module';
import { RatingModule } from '@/rating/rating.module';

import { AllExceptionsFilter } from '@/core/all-exeptiions.filter';

@Module({
	imports: [
		ConfigModule.forRoot({
			cache: true,
		}),
		MongooseModule.forRootAsync({
			imports: [ConfigModule, CacheModule.register()],
			inject: [ConfigService],
			useFactory: getMongoDbConfig,
		}),
		AuthModule,
		UserModule,
		GenreModule,
		FileModule,
		ActorModule,
		MovieModule,
		RatingModule,
		TelegramModule,
	],
	providers: [
		{
			provide: APP_FILTER,
			useClass: AllExceptionsFilter,
		},
	],
})
export class AppModule {}

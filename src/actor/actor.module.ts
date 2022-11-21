import { CacheModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Actor, ActorSchema } from '@/actor/schemas/actor.schema';
import { ActorService } from '@/actor/actor.service';
import { ActorController } from '@/actor/actor.controller';
import { FileModule } from '@/file/file.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Actor.name,
				schema: ActorSchema,
			},
		]),
		FileModule,
		CacheModule.register(),
	],
	controllers: [ActorController],
	providers: [ActorService],
})
export class ActorModule {}

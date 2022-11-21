import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { FileService } from '@/file/file.service';
import { PublicFile, PublicFileSchema } from '@/file/schemas/file.schema';
import { FileController } from '@/file/file.controller';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: PublicFile.name, schema: PublicFileSchema }]),
		ConfigModule,
	],
	controllers: [FileController],
	providers: [FileService],
	exports: [FileService],
})
export class FileModule {}

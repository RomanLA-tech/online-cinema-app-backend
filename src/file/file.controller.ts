import {
	Controller,
	Delete,
	HttpCode,
	Param,
	Post,
	UploadedFile,
	UseInterceptors,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { FastifyFileInterceptor } from 'nest-fastify-multer';

import { FileService } from '@/file/file.service';
import { IdValidationPipe } from '@/pipes/IdValidation.pipe';
import { Types } from 'mongoose';
import { Auth } from '@/decorators/auth.decorator';
import { ADMIN, FILE_FIELD_NAME, FILES_PREFIX, ID, ID_TERM } from '@constants';

@Controller(FILES_PREFIX)
export class FileController {
	constructor(private readonly fileService: FileService) {}

	@Post()
	@Auth(ADMIN)
	@UsePipes(new ValidationPipe())
	@UseInterceptors()
	@FastifyFileInterceptor(FILE_FIELD_NAME, 1)
	@HttpCode(200)
	async uploadFile(@UploadedFile() file: Express.Multer.File) {
		return this.fileService.uploadPublicFile(file.buffer, file.originalname);
	}

	@Delete(ID_TERM)
	@Auth(ADMIN)
	@HttpCode(200)
	async deleteFile(@Param(ID, IdValidationPipe) fileId: Types.ObjectId) {
		return this.fileService.deletePublicFile(fileId);
	}
}

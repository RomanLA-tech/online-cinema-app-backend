import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuid } from 'uuid';
import { S3 } from 'aws-sdk';
import { Model, Types } from 'mongoose';

import { PublicFile, PublicFileDocument } from '@/file/schemas/file.schema';
import { ISendData } from '@/file/interfaces/file.interface';
import { NOT_FOUND, UPLOAD_FILE_ERROR } from '@constants';

@Injectable()
export class FileService {
	constructor(
		@InjectModel(PublicFile.name) private readonly fileModel: Model<PublicFileDocument>,
		private readonly configService: ConfigService
	) {}

	async uploadPublicFile(
		dataBuffer: Buffer,
		filename: string,
		folder?: string
	): Promise<PublicFileDocument> {
		const uploadedFile = await this.uploadFileToBucket(filename, dataBuffer, folder);
		if (!uploadedFile) {
			throw new InternalServerErrorException(UPLOAD_FILE_ERROR, `File uploading failed`);
		}
		return await new this.fileModel({
			key: uploadedFile.Key,
			url: uploadedFile.Location,
		}).save();
	}

	async deletePublicFile(fileId: Types.ObjectId): Promise<PublicFileDocument> {
		const file = await this.findFileById(fileId);
		await this.deleteFileFromBucket(file);
		return await this.fileModel.findByIdAndDelete(file._id).exec();
	}

	///////////////////////Private methods///////////////////////

	private async findFileById(fileId: Types.ObjectId): Promise<PublicFileDocument> {
		const file = await this.fileModel.findById(fileId);
		if (!file) {
			throw new NotFoundException(NOT_FOUND, `File with id: ${fileId} not found`);
		}
		return file;
	}

	private async uploadFileToBucket(
		filename: string,
		dataBuffer: Buffer,
		folder?: string
	): Promise<ISendData> {
		return new S3()
			.upload({
				Bucket: `${this.configService.get<string>('AWS_S3_STORE_NAME')}${folder}`,
				Body: dataBuffer,
				Key: `${uuid()}-${filename}`,
			})
			.promise();
	}

	private async deleteFileFromBucket(file: PublicFileDocument): Promise<void> {
		await new S3()
			.deleteObject({
				Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
				Key: file.key,
			})
			.promise();
	}
}

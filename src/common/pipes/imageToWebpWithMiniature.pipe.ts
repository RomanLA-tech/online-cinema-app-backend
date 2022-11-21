import { Injectable, PipeTransform } from '@nestjs/common';
import * as sharp from 'sharp';
import * as path from 'path';
import { OPTIMIZED_IMAGE_PREFIX, WEBP } from '@/common/constants';

export interface IMoviePosters extends Express.Multer.File {
	bufferMin: Buffer;
	originalnameMin: string;
}

@Injectable()
export class imageToWebpWithMiniaturePipe
	implements PipeTransform<Express.Multer.File, Promise<Express.Multer.File>>
{
	async transform(file: Express.Multer.File): Promise<IMoviePosters> {
		const originalName = path.parse(file.originalname).name;
		const filename = OPTIMIZED_IMAGE_PREFIX + originalName + WEBP;
		const filenameMin = OPTIMIZED_IMAGE_PREFIX + 'min-' + originalName + WEBP;
		const buffer = await sharp(file.buffer, { animated: true }).webp({ effort: 3 }).toBuffer();
		const bufferMin = await sharp(buffer)
			.resize(300, 300, {
				fit: sharp.fit.inside,
				withoutEnlargement: true,
			})
			.toBuffer();
		return { ...file, buffer, bufferMin, originalnameMin: filenameMin, originalname: filename };
	}
}

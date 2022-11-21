import { Injectable, PipeTransform } from '@nestjs/common';
import * as sharp from 'sharp';
import * as path from 'path';
import { OPTIMIZED_IMAGE_PREFIX, WEBP } from '@/common/constants';

@Injectable()
export class ImageToWebpPipe
	implements PipeTransform<Express.Multer.File, Promise<Express.Multer.File>>
{
	async transform(file: Express.Multer.File): Promise<Express.Multer.File> {
		const originalName = path.parse(file.originalname).name;
		const filename = OPTIMIZED_IMAGE_PREFIX + originalName + WEBP;
		const buffer = await sharp(file.buffer, { animated: true }).webp({ effort: 3 }).toBuffer();
		return { ...file, buffer, originalname: filename };
	}
}

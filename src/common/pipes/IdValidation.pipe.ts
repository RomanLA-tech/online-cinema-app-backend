import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';
import { INVALID_CREDENTIALS } from '@/common/constants';

export class IdValidationPipe implements PipeTransform {
	transform(value: string, metadata: ArgumentMetadata): any {
		if (metadata.type !== 'param') {
			return value;
		}
		if (!Types.ObjectId.isValid(value)) {
			throw new BadRequestException(INVALID_CREDENTIALS, 'Invalid ID format');
		}
		return value;
	}
}

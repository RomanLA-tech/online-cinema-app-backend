import { ConfigService } from '@nestjs/config';

import { ConfigurationOptions } from 'aws-sdk/lib/config-base';

export const getAwsConfig = async (
	configService: ConfigService
): Promise<ConfigurationOptions> => ({
	accessKeyId: configService.get<string>('AWS_S3_ACCESS_KEY'),
	secretAccessKey: configService.get<string>('AWS_S3_KEY_SECRET'),
	region: configService.get<string>('AWS_REGION'),
});

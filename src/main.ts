import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { contentParser } from 'fastify-multer';
import helmet from '@fastify/helmet';
import compression from '@fastify/compress';
import { config } from 'aws-sdk';
import * as morgan from 'morgan';

import { AppModule } from './app.module';
import { getAwsConfig } from '@/config/aws-s3.config';
import { logStream } from '@/core/log-stream';
import { GLOBAL_PREFIX } from '@constants';

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
	await app.register(helmet);
	await app.enableCors();
	app.setGlobalPrefix(GLOBAL_PREFIX);
	app.useGlobalPipes(new ValidationPipe({ transform: true }));
	await app.register(contentParser);
	const configService = app.get(ConfigService);
	await config.update(await getAwsConfig(configService));
	await app.use(morgan('tiny', { stream: logStream }));
	await app.register(compression, { encodings: ['gzip', 'deflate'] });

	await app.listen(process.env.PORT);
	console.info(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();

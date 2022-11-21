import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';

import {
	CustomHttpExceptionResponse,
	HttpExceptionResponse,
} from '@/core/interfaces/http-exception-response.interface';
import { UNAUTHORIZED } from '@/common/constants';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const reply = ctx.getResponse();
		const request = ctx.getRequest();

		let status: HttpStatus;
		let errorMessage: string;

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const errorResponse = exception.getResponse();
			errorMessage = (errorResponse as HttpExceptionResponse).error || exception.message;
		} else {
			status = HttpStatus.NOT_FOUND;
			errorMessage = `Not found`;
		}

		const errorResponse = this.getErrorResponse(status, errorMessage, request);
		const errorLog = this.getErrorLog(errorResponse, request, reply, exception);
		this.writeErrorLogToFile(errorLog);
		reply.statusCode = errorResponse.statusCode;
		reply.send({ code: errorResponse.statusCode, errorMessage });
	}

	private getErrorResponse = (
		status: HttpStatus,
		errorMessage: string,
		request: Request
	): CustomHttpExceptionResponse => ({
		statusCode: status,
		error: errorMessage,
		path: request.url,
		method: request.method,
		timeStamp: new Date(),
	});

	private getErrorLog = (
		errorResponse: CustomHttpExceptionResponse,
		request,
		reply,
		exception: unknown
	): string => {
		const { statusCode, error } = errorResponse;
		const { method, url } = request;
		return `
		=========================================================================================
		   Response code: ${statusCode} - Method: ${method} - URL: ${url}
		   User: ${
					!!request.user
						? JSON.stringify({
								id: request?.user?._id,
								email: request?.user?.email,
								isAdmin: request?.user?.isAdmin,
						  })
						: UNAUTHORIZED
				} - IP: ${request.ip}
		_________________________________________________________________________________________\n
		${exception instanceof HttpException ? exception.stack : error} \n
		=========================================================================================
		\n\n
		`;
	};

	private writeErrorLogToFile = (errorLog: string): void => {
		fs.appendFile(`error.log`, errorLog, 'utf8', err => {
			if (err) throw err;
		});
	};
}

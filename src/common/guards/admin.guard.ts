import { CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserDocument } from '@/user/schemas/user.schema';
import { FORBIDDEN } from '@/common/constants';

export class OnlyAdminGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<{ user: UserDocument }>();
		const user = request.user;

		if (!user.isAdmin) {
			throw new ForbiddenException(FORBIDDEN, "You don't have administrator rights");
		}

		return user.isAdmin;
	}
}

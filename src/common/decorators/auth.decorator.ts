import { applyDecorators, UseGuards } from '@nestjs/common';

import { TypeRole } from '@/auth/interfaces/auth.interface';
import { JwtAuthGuard } from '@/guards/jwt.guard';
import { OnlyAdminGuard } from '@/guards/admin.guard';
import { ADMIN, USER } from '@/common/constants';

export const Auth = (role: TypeRole = USER) =>
	applyDecorators(
		role === ADMIN ? UseGuards(JwtAuthGuard, OnlyAdminGuard) : UseGuards(JwtAuthGuard)
	);

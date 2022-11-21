import { CacheModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from '@/user/schemas/user.schema';
import { UserController } from '@/user/user.controller';
import { UserService } from '@/user/user.service';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
		CacheModule.register(),
	],
	controllers: [UserController],
	providers: [UserService],
})
export class UserModule {}

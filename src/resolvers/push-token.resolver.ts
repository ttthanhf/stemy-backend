import { GraphQLError } from 'graphql';
import {
	Arg,
	Ctx,
	Mutation,
	Query,
	Resolver,
	UseMiddleware
} from 'type-graphql';
import { PushToken } from '~entities/push-token.entity';
import { AuthMiddleware } from '~middlewares/auth.middleware';
import { PushTokenService } from '~services/push-token.service';
import { UserService } from '~services/user.service';
import { Context } from '~types/context.type';

@Resolver(() => PushToken)
export class PushTokenResolver {
	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Mutation(() => PushToken)
	async savePushToken(
		@Ctx() ctx: Context,
		@Arg('deviceId') deviceId: string,
		@Arg('token') token: string,
		@Arg('platform') platform: string
	) {
		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);

		if (!user) {
			throw new GraphQLError('User not found');
		}

		return await PushTokenService.savePushToken(
			user,
			deviceId,
			token,
			platform
		);
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Mutation(() => Boolean)
	async deactivatePushToken(
		@Ctx() ctx: Context,
		@Arg('deviceId') deviceId: string
	) {
		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);

		if (!user) {
			throw new GraphQLError('User not found');
		}

		await PushTokenService.deactivatePushToken(user, deviceId);
		return true;
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Query(() => [PushToken])
	async getPushTokens(@Ctx() ctx: Context) {
		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('User not found');
		}
		return await PushTokenService.getPushTokens(user);
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Query(() => PushToken, { nullable: true })
	async getPushToken(@Ctx() ctx: Context, @Arg('deviceId') deviceId: string) {
		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('User not found');
		}
		const pushToken = await PushTokenService.getPushToken(user, deviceId);
    if (!pushToken) {
      return null;
    }

    return pushToken;
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Mutation(() => Boolean)
	async testPushNotification(@Ctx() ctx: Context) {
		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('User not found');
		}
		return await PushTokenService.pushNotificationToUser(
			user,
			'Test',
			'Test',
			{}
		);
	}
}

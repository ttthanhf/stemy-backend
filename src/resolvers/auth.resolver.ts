import { GraphQLError } from 'graphql';
import { AccessTokenResponse } from 'models/responses/token.response';
import { Arg, Args, Mutation, Query, Resolver } from 'type-graphql';
import { RegisterArgs } from '~types/args/auth.arg';
import { AuthProviderName } from '~constants/oauth2.constant';
import { User } from '~entities/user.entity';
import { Oauth2Service } from '~services/oauth2.service';
import { UserService } from '~services/user.service';
import { CryptoUtil } from '~utils/crypto.util';
import logger from '~utils/logger.util';
import mailUtil from '~utils/mail.util';
import { env } from '~configs/env.config';
import { JWTUtil } from '~utils/jwt.util';
import { MapperUtil } from '~utils/mapper.util';
import { RedisService } from '~services/redis.service';

@Resolver()
export class AuthResolver {
	@Mutation(() => AccessTokenResponse)
	async register(@Args() args: RegisterArgs) {
		const user = await UserService.getUserByEmail(args.email);

		if (user) {
			logger.debug(`Email already exist`);
			throw new GraphQLError('Email already exist');
		}

		let newUser = MapperUtil.mapObjectToClass(args, User);

		newUser = await UserService.createNewUser(newUser);

		const access_token = UserService.generateUserAccessToken(newUser);

		return { access_token };
	}

	@Mutation(() => AccessTokenResponse)
	async login(@Arg('email') email: string, @Arg('password') password: string) {
		const user = await UserService.getUserByEmail(email);
		if (!user) {
			logger.debug(`User not exist`);
			throw new GraphQLError('Email or Password not correct !');
		}

		const isCorrect = await CryptoUtil.comparePassword(password, user.password);

		if (!isCorrect) {
			logger.debug(`UserId ${user?.id}: Input wrong password`);
			throw new GraphQLError('Email or Password not correct !');
		}

		const access_token = UserService.generateUserAccessToken(user);
		return { access_token };
	}

	@Query(() => String)
	async getOauth2GoogleURL() {
		return Oauth2Service.getOauth2URL(AuthProviderName.GOOGLE);
	}

	@Mutation(() => AccessTokenResponse)
	async loginWithGoogle(@Arg('code') code: string) {
		const info = await Oauth2Service.getInfoByLoginWithGoogle(code);
		let user = await UserService.getUserByEmail(info.email);

		if (!user) {
			user = new User();
			user.email = info.email;
			user.fullName = info.name;

			user = await UserService.createNewUser(user);
		}

		const access_token = UserService.generateUserAccessToken(user);
		return { access_token };
	}

	@Mutation(() => String)
	async forgotPassword(@Arg('email') email: string) {
		const user = await UserService.getUserByEmail(email);
		if (!user) {
			throw new GraphQLError('User not found');
		}

		const token = JWTUtil.sign({ id: user.id, type: 'forgot-password' });

		mailUtil.sendMailRecoveryPassword(
			email,
			env.MAIL_REDIRECT + '?token=' + token
		);

		await RedisService.setForgotPasswordToken(token);

		return 'Success';
	}

	@Mutation(() => String)
	async resetPassword(
		@Arg('token') token: string,
		@Arg('password') password: string
	) {
		const storedToken = await RedisService.getForgotPasswordToken(token);

		if (!storedToken) {
			throw new GraphQLError('Token invalid');
		}

		const info = JWTUtil.verify(token);

		if (!info) {
			throw new GraphQLError('Token invalid');
		}

		if (info.payload.type != 'forgot-password') {
			throw new GraphQLError('Token invalid');
		}

		const user = await UserService.getUserById(info.payload.id);

		if (!user) {
			throw new GraphQLError('User not found. Token invalid');
		}

		user.password = password;

		await UserService.updateUser(user);

		await RedisService.removeForgotPasswordToken(token);

		return 'Success';
	}
}

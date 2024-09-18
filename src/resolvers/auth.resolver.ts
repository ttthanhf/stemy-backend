import { GraphQLError } from 'graphql';
import { AccessTokenResponse } from 'models/responses/token.response';
import { Arg, Args, Mutation, Resolver } from 'type-graphql';
import { EmailAndPasswordArg } from '~types/args/auth.arg';
import { AuthProviderName } from '~constants/oauth2.constant';
import { User } from '~entities/user.entity';
import { Oauth2Service } from '~services/oauth2.service';
import { UserService } from '~services/user.service';
import { CryptoUtil } from '~utils/crypto.util';
import logger from '~utils/logger.util';

@Resolver()
export class AuthResolver {
	@Mutation(() => AccessTokenResponse)
	async register(@Args() args: EmailAndPasswordArg) {
		const { email, password } = args;

		const user = await UserService.getUserByEmail(email);

		if (user) {
			logger.debug(`Email already exist`);
			throw new GraphQLError('Email already exist');
		}

		let newUser = new User();
		newUser.email = email;
		newUser.password = password;

		newUser = await UserService.createNewUser(newUser);

		const access_token = UserService.generateUserAccessToken(newUser);

		return { access_token };
	}

	@Mutation(() => AccessTokenResponse)
	async login(@Args() args: EmailAndPasswordArg) {
		const { email, password } = args;
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

	@Mutation(() => String)
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
}

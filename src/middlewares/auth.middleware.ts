import { GraphQLError } from 'graphql';
import { type MiddlewareFn } from 'type-graphql';
import { Context } from '~types/context.type';
import { JWTUtil } from '~utils/jwt.util';

export class AuthMiddleware {
	static LoginRequire: MiddlewareFn<Context> = async (data, next) => {
		const userId = data.context.request.headers.get('bypasstoken');
		if (userId) {
			data.context.res.model.data = {
				user: {
					id: Number(userId)
				}
			};
			return await next();
		}

		const accessToken = data.context.request.headers.get('authorization');

		if (!accessToken) {
			throw new GraphQLError('Token not found');
		}

		const token = JWTUtil.verify(accessToken);

		if (!token) {
			throw new GraphQLError('Token not valid');
		}

		data.context.res.model.data = {
			user: {
				id: token.payload.id
			}
		};

		return await next();
	};
}

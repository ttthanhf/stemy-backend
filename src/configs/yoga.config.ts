import { useExecutionCancellation, YogaServerOptions } from 'graphql-yoga';
import { buildSchema } from 'type-graphql';
import { UserResolver } from '~resolvers/user.resolver';
import logger from '~utils/logger.util';
import { env } from './env.config';
import { AuthResolver } from '~resolvers/auth.resolver';
import { ProductResolver } from '~resolvers/product.resolver';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
export const yogaConfig: YogaServerOptions<any, any> = {
	schema: buildSchema({
		resolvers: [UserResolver, AuthResolver, ProductResolver]
	}),
	maskedErrors: true,
	plugins: [useExecutionCancellation()],
	graphiql: {
		defaultQuery: `
            query {
                meow
            }
        `
	},
	logging: env.SERVER_LOG_DB_DEBUG
		? {
				debug(...args) {
					logger.debug(args.toString());
				},
				info(...args) {
					logger.info(args.toString());
				},
				warn(...args) {
					logger.warn(args.toString());
				},
				error(...args) {
					logger.error(JSON.stringify(args));
					console.log(args);
				}
			}
		: false
};

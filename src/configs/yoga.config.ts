import { useExecutionCancellation, YogaServerOptions } from 'graphql-yoga';
import { buildSchema } from 'type-graphql';
import { UserResolver } from '~resolvers/user.resolver';
import { AuthResolver } from '~resolvers/auth.resolver';
import { ProductResolver } from '~resolvers/product.resolver';
import { GlobalMiddleware } from '~middlewares/global.middleware';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
export const yogaConfig: YogaServerOptions<any, any> = {
	schema: buildSchema({
		resolvers: [UserResolver, AuthResolver, ProductResolver],
		globalMiddlewares: [GlobalMiddleware.ErrorInterceptor]
	}),
	maskedErrors: true,
	plugins: [useExecutionCancellation()],
	graphiql: {
		defaultQuery: `
            query {
                meow
            }
        `
	}
	// Move to use global exception
	// logging: env.SERVER_LOG_DB_DEBUG
	// 	? {
	// 			debug(...args) {
	// 				logger.debug(args.toString());
	// 			},
	// 			info(...args) {
	// 				logger.info(args.toString());
	// 			},
	// 			warn(...args) {
	// 				logger.warn(args.toString());
	// 			},
	// 			error(...args) {
	// 				logger.error(args);
	// 			}
	// 		}
	// 	: false
};

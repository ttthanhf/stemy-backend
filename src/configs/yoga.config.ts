import { costLimitPlugin } from '@escape.tech/graphql-armor-cost-limit';
import { maxAliasesPlugin } from '@escape.tech/graphql-armor-max-aliases';
import { maxDepthPlugin } from '@escape.tech/graphql-armor-max-depth';
import { maxDirectivesPlugin } from '@escape.tech/graphql-armor-max-directives';
import { maxTokensPlugin } from '@escape.tech/graphql-armor-max-tokens';
import { GraphQLError, ValidationContext } from 'graphql';
import { useExecutionCancellation, YogaServerOptions } from 'graphql-yoga';
import { buildSchema } from 'type-graphql';
import { GlobalMiddleware } from '~middlewares/global.middleware';
import { AuthResolver } from '~resolvers/auth.resolver';
import { CartResolver } from '~resolvers/cart.resolver';
import { OrderResolver } from '~resolvers/order.resolver';
import { ProductResolver } from '~resolvers/product.resolver';
import { ProductCategoryResolver } from '~resolvers/productCategory.resolver';
import { UserResolver } from '~resolvers/user.resolver';
import { FileScalar, FileScalarType } from '~types/scalars/file.scalar';
import logger from '~utils/logger.util';

function logReject(ctx: ValidationContext | null, error: GraphQLError) {
	const info = ctx?.getDocument().loc?.source.body.trim().replace(/\s+/g, ' ');
	logger.warn(`${String(error)}: ${info}`);
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
export const yogaConfig: YogaServerOptions<any, any> = {
	schema: buildSchema({
		resolvers: [
			UserResolver,
			AuthResolver,
			ProductResolver,
			CartResolver,
			OrderResolver,
			ProductCategoryResolver
		],
		globalMiddlewares: [GlobalMiddleware.ErrorInterceptor],
		scalarsMap: [{ type: FileScalarType, scalar: FileScalar }]
	}),
	maskedErrors: true,
	plugins: [
		useExecutionCancellation(),
		maxDepthPlugin({
			n: 4,
			propagateOnRejection: true,
			onReject: [logReject]
		}),
		maxAliasesPlugin({
			n: 2,
			onReject: [logReject]
		}),
		maxDirectivesPlugin({
			n: 0,
			onReject: [logReject]
		}),
		costLimitPlugin({
			maxCost: 100,
			onReject: [logReject]
		}),
		maxTokensPlugin({
			n: 500,
			onReject: [logReject]
		})
	],
	graphiql: {
		defaultQuery: `
            query {
				__typename
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

import { defineConfig, MariaDbDriver } from '@mikro-orm/mariadb';

import { env } from './env.config';
import logger from '~utils/logger.util';
import { User, UserLab } from '~entities/user.entity';
import { Product, ProductCategory, ProductLab } from '~entities/product.entity';
import { Order, OrderItem } from '~entities/order.entity';
import { Feedback } from '~entities/feedback.entity';
import { Cart } from '~entities/cart.entity';

const orderEntities = [Order, OrderItem];
const productEntities = [Product, ProductCategory, ProductLab];
const userEntities = [User, UserLab];
const otherEntities = [Feedback, Cart];
const entities = [
	...userEntities,
	...productEntities,
	...orderEntities,
	...otherEntities
];

export default defineConfig({
	driver: MariaDbDriver,
	entities: entities,
	entitiesTs: entities,
	dbName: env.DB_MARIABD_DATABASE,
	user: env.DB_MARIABD_USER,
	password: env.DB_MARIABD_PASSWORD,
	host: env.DB_MARIABD_HOST,
	port: env.DB_MARIABD_PORT,
	debug: env.SERVER_LOG_DB_DEBUG,
	logger: (msg) => {
		logger.debug(msg);
	},
	pool: {
		min: 2,
		max: 10
	},
	collate: 'utf8mb4_general_ci'
});

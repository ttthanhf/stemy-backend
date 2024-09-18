import { Redis, RedisKey } from 'ioredis';
import { redisConfig } from '~configs/redis.config';
import logger from '~utils/logger.util';

class RedisDB {
	redis!: Redis;
	constructor() {
		if (!this.redis) {
			this.redis = new Redis(redisConfig);

			this.redis.on('error', (err) => {
				logger.fatal(err);
				throw new Error(String(err));
			});

			this.redis.ping().then(() => {
				logger.info('Connected to Redis');
			});
		}
	}

	async set(key: RedisKey, value: string | number) {
		return await this.redis.set(key, value);
	}

	async get(key: RedisKey) {
		return await this.redis.get(key);
	}

	async remove(key: RedisKey) {
		return await this.redis.del(key);
	}

	test() {}
}

export default new RedisDB();

import redisDb from 'database/redis.db';

export class RedisService {
	private static FORGOT_PASSWORD_HEAD = 'forgot-password-';

	static async setForgotPasswordToken(token: string) {
		return redisDb.redis.set(
			this.FORGOT_PASSWORD_HEAD + token,
			'1',
			'EX',
			60 * 15,
			'NX'
		);
	}

	static async getForgotPasswordToken(token: string) {
		return redisDb.redis.get(this.FORGOT_PASSWORD_HEAD + token);
	}

	static async removeForgotPasswordToken(token: string) {
		return redisDb.redis.del(this.FORGOT_PASSWORD_HEAD + token);
	}
}

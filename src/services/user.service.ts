import { User } from '~entities/user.entity';
import userRepository from '~repositories/user.repository';
import { env } from '~configs/env.config';
import { DateTimeUtil } from '~utils/datetime.util';
import { JWT } from '~utils/jwt.util';

export class UserService {
	static async createNewUser(user: User): Promise<User> {
		const newUser = userRepository.create(user);
		await userRepository.save(newUser);
		return newUser;
	}

	static generateUserAccessToken(user: User) {
		const access_token = JWT.sign({
			payload: {
				id: user.id
			},
			expiresIn: DateTimeUtil.calculateFutureTimestamp(env.JWT_EXPIRE)
		});
		return access_token;
	}

	static async getUserByEmail(email: string) {
		return await userRepository.findOne({
			email
		});
	}
}

import { User } from '~entities/user.entity';
import {
	userLabRepository,
	userRepository
} from '~repositories/user.repository';
import { env } from '~configs/env.config';
import { DateTimeUtil } from '~utils/datetime.util';
import { JWTUtil } from '~utils/jwt.util';
import { UserArg } from '~types/args/user.arg';
import { FileUpload } from '~types/scalars/file.scalar';
import { NumberUtil } from '~utils/number.util';
import { UploadService } from './upload.service';
/* eslint-disable @typescript-eslint/no-explicit-any */

export class UserService {
	static async createNewUser(user: User): Promise<User> {
		return userRepository.createAndSave(user);
	}

	static async updateUser(user: User): Promise<void> {
		return userRepository.save(user);
	}

	static generateUserAccessToken(user: User) {
		const access_token = JWTUtil.sign({
			payload: {
				id: user.id
			},
			expiresIn: DateTimeUtil.calculateFutureTimestamp(env.JWT_EXPIRE)
		});
		return access_token;
	}

	static async getAllUser(fields?: any) {
		return userRepository.find({}, { fields });
	}

	static async getUserWithFilters(filters: UserArg, fields?: any) {
		return userRepository.findOne(filters, {
			fields
		});
	}

	static async getUserByEmail(email: string) {
		return userRepository.findOne({
			email
		});
	}

	static async getUserById(id: number, fields?: any) {
		return userRepository.findOne(
			{
				id
			},
			{
				fields
			}
		);
	}

	static async uploadAvatar(user: User, image: FileUpload) {
		const imageName =
			'stemy-avatar-' +
			user.id +
			'-T-' +
			String(Date.now()) +
			'-' +
			NumberUtil.getRandomNumberByLength(3) +
			'.png';

		await UploadService.uploadFile(imageName, image.blobParts[0]);

		return env.S3_HOST + imageName;
	}
}

export class UserLabService {
	static async getUserLabByUserIdAndProductId(
		userId: number,
		productId: number
	) {
		return userLabRepository.findOne(
			{
				user: {
					id: userId
				},
				productLab: {
					product: {
						id: productId
					}
				}
			},
			{
				populate: [
					'productLab',
					'productLab.product',
					'user',
					'orderItem',
					'orderItem.order'
				]
			}
		);
	}

	static async isUserHasThisLabByProductId(userId: number, productId: number) {
		const count = await userLabRepository.count({
			user: { id: userId },
			productLab: {
				product: {
					id: productId
				}
			}
		});

		return count > 0;
	}

	static async getUserLabsByUserId(userId: number, fields: any) {
		return userLabRepository.find(
			{
				user: {
					id: userId
				}
			},
			{
				fields
			}
		);
	}
}

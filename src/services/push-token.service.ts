import { GraphQLError } from 'graphql';
import { Order } from '~entities/order.entity';
import { PushToken } from '~entities/push-token.entity';
import { User } from '~entities/user.entity';
import { pushTokenRepository } from '~repositories/push-token.repository';
import pushNotificationUtil from '~utils/push-token.util';

export class PushTokenService {
	static async savePushToken(
		user: User,
		deviceId: string,
		token: string,
		platform: string
	) {
		let pushToken = await pushTokenRepository.findOne({ deviceId, user });

		if (pushToken) {
			pushToken.token = token;
			pushToken.platform = platform;
			pushToken.isActive = true;
		} else {
			pushToken = new PushToken();
			pushToken.user = user;
			pushToken.deviceId = deviceId;
			pushToken.token = token;
			pushToken.platform = platform;
		}

		return pushTokenRepository.save(pushToken);
	}

	static async deactivatePushToken(user: User, deviceId: string) {
		const pushToken = await pushTokenRepository.findOne({ deviceId, user });

		if (!pushToken) {
			throw new GraphQLError('Push token not found');
		}

		pushToken.isActive = false;
		return pushTokenRepository.save(pushToken);
	}

	static async getActivePushTokensByUserId(userId: number) {
		return pushTokenRepository.find({
			user: { id: userId },
			isActive: true
		});
	}

	static async sendOrderStatusNotification(order: Order) {
		const pushTokens = await this.getActivePushTokensByUserId(order.user.id);
		const tokens = pushTokens.map((pt) => pt.token);

		if (tokens.length > 0) {
			await pushNotificationUtil.sendPushNotification(
				tokens,
				'Order Status Update',
				`Your order #${order.id} status has changed to ${order.status}`,
				{ orderId: order.id, status: order.status }
			);
		}
	}

  static async getPushTokens(user: User) {
    return pushTokenRepository.find({
      user
    });
  }

  static async getPushToken(user: User, deviceId: string) {
    return pushTokenRepository.findOne({ deviceId, user });
  }
  }

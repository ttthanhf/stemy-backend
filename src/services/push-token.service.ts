/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLError } from 'graphql';
import { Order } from '~entities/order.entity';
import { PushToken } from '~entities/push-token.entity';
import { Ticket } from '~entities/ticket.entity';
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

		await pushTokenRepository.save(pushToken);
		return pushToken;
	}

	static async deactivatePushToken(user: User, deviceId: string) {
		const pushToken = await pushTokenRepository.findOne({ deviceId, user });

		if (!pushToken) {
			throw new GraphQLError('Push token not found');
		}

		pushToken.isActive = false;
		await pushTokenRepository.save(pushToken);
	}

	static async getActivePushTokensByUserId(userId: number) {
		return pushTokenRepository.find({
			user: { id: userId },
			isActive: true
		});
	}

	static async sendOrderStatusNotification(order: Order) {
		const user = order.user;

		await this.pushNotificationToUser(
			user,
			'Order Status Update',
			`Your order #${order.id} status has changed to ${order.status}`,
			{ orderId: order.id, status: order.status }
		);
	}

	static async sendPushNotificationToReplier(ticket: Ticket) {
		const replier = ticket.replier; // Get the replier from the ticket
		await this.pushNotificationToUser(
			replier,
			'New ticket comming',
			`You receive a new ticket #${ticket.id}: ${ticket.title}`,
			{ ticketId: ticket.id }
		);
	}

	static async sendPushNotificationToSender(ticket: Ticket) {
		const sender = ticket.sender;
		await this.pushNotificationToUser(
			sender,
			'Ticket Resolved',
			`Your ticket has been resolved #${ticket.id}: ${ticket.title}`,
			{
				replier: ticket.replier,
				comment: ticket.replierComment
			}
		);
	}

	static async sendActiveLabPushNotification(user: User) {
		await this.pushNotificationToUser(
			user,
			'Lab activated',
			'Your lab is activated. Discover it now!',
			{}
		);
	}

	static async sendOrderSuccessfulPushNotification(order: Order) {
		const user = order.user;
		await this.pushNotificationToUser(
			user,
			'Thank you for your order',
			'Your order is being processed',
			{
				orderId: order.id
			}
		);
	}

	static async pushNotificationToUser(
		user: User,
		title: string,
		body: string,
		data: any
	) {
		const pushTokens = await this.getActivePushTokensByUserId(user.id);
		const tokens = pushTokens.map((pt) => pt.token);
		if (tokens.length > 0) {
			await pushNotificationUtil.sendPushNotification(
				tokens,
				title,
				body,
				data
			);
			return true;
		} else {
			return false;
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

import { Expo } from 'expo-server-sdk';
import logger from './logger.util';

class PushNotificationUtil {
	private expo: Expo;

	constructor() {
		this.expo = new Expo();
	}

	async sendPushNotification(
		pushTokens: string[],
		title: string,
		body: string,
		data?: object
	) {
		const messages = pushTokens.map((pushToken) => ({
			to: pushToken,
			sound: 'default',
			title,
			body,
			data
		}));

		const chunks = this.expo.chunkPushNotifications(messages);

		for (const chunk of chunks) {
			try {
				await this.expo.sendPushNotificationsAsync(chunk);
			} catch (error) {
				logger.error(error);
			}
		}
	}
}

export default new PushNotificationUtil();

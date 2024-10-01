import { TemplatedApp } from 'uWebSockets.js';
import { WebHookController } from '~controllers/webhook.controller';

export function webHookRoute(app: TemplatedApp) {
	app.get(
		'/webhook/order/:orderId/delivering',
		WebHookController.changeStatusToDelivering
	);

	app.get(
		'/webhook/order/:orderId/delivered',
		WebHookController.changeStatusToDelivered
	);
}

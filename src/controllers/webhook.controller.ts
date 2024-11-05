import { HttpRequest, HttpResponse } from 'uWebSockets.js';
import { OrderStatus } from '~constants/order.constant';
import { Product } from '~entities/product.entity';
import { OrderService } from '~services/order.service';
import { ProductService } from '~services/product.service';
import { PushTokenService } from '~services/push-token.service';

export class WebHookController {
	static async changeStatusToDelivering(res: HttpResponse, req: HttpRequest) {
		const orderId = req.getParameter(0);
		const order = await OrderService.getOrderById(Number(orderId));
		if (!order) {
			res.model.errors = {
				message: 'Order out found'
			};
			res.model.send();
			return;
		}

		order.status = OrderStatus.DELIVERING;
		await OrderService.updateOrder(order);

    // send push noti when status changed
    await PushTokenService.sendOrderStatusNotification(order)

		res.model.data = 'Success';
		res.model.send();
		return;
	}

	static async changeStatusToDelivered(res: HttpResponse, req: HttpRequest) {
		const orderId = req.getParameter(0);
		const order = await OrderService.getOrderById(Number(orderId));
		if (!order) {
			res.model.errors = {
				message: 'Order out found'
			};
			res.model.send();
			return;
		}

		order.status = OrderStatus.DELIVERED;
		order.shipTime = new Date();

		await OrderService.updateOrder(order);

		const products: Product[] = [];
		for (const orderItem of order.orderItems) {
			const product = orderItem.product;
			product.sold += 1;

			products.push(product);
		}

		await ProductService.updateProducts(products);

    // send push noti for status changed
    await PushTokenService.sendOrderStatusNotification(order)

		res.model.data = 'Success';
		res.model.send();
		return;
	}
}

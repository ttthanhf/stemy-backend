import { createHmac } from 'crypto';
import { GraphQLError } from 'graphql';
import { env } from '~configs/env.config';
import { OrderStatus } from '~constants/order.constant';
import { PaymentProvider } from '~constants/payment.constant';
import { Cart } from '~entities/cart.entity';
import { Order, OrderItem } from '~entities/order.entity';
import { User } from '~entities/user.entity';
import { orderRepository } from '~repositories/order.repository';
import { CheckoutOrderInput } from '~types/inputs/order.input';
import { DateTimeUtil } from '~utils/datetime.util';
import { NumberUtil } from '~utils/number.util';
import { ObjectUtil } from '~utils/object.util';
import { QueryString } from '~utils/query-string.util';

export class OrderService {
	static async createOrder(
		user: User,
		orderItems: OrderItem[],
		phone: string,
		address: string,
		paymentProvider: PaymentProvider
	) {
		const order = new Order();
		order.user = user;
		order.phone = phone;
		order.address = address;
		order.payment.provider = paymentProvider;
		order.status = OrderStatus.CREATED;

		orderItems.forEach((orderItem) => order.orderItems.add(orderItem));
		order.totalPrice = orderItems.reduce(
			(totalValue, currentValue) =>
				totalValue + (currentValue.quantity + currentValue.unitPrice),
			0
		);

		return orderRepository.createAndSave(order);
	}

	static prepareOrderItem(carts: Cart[]) {
		const orderItems: OrderItem[] = [];
		carts.forEach((cart) => {
			const orderItem = new OrderItem();
			orderItem.product = cart.product;
			orderItem.quantity = cart.quantity;
			orderItem.unitPrice = cart.product.price;

			orderItems.push(orderItem);
		});
		return orderItems;
	}

	static async getVNPayURL(order: Order) {
		let vnp_params: {
			vnp_Version: string;
			vnp_Command: string;
			vnp_TmnCode: string;
			vnp_Locale: string;
			vnp_CurrCode: string;
			vnp_TxnRef: number;
			vnp_OrderInfo: string;
			vnp_Amount: number;
			vnp_ReturnUrl: string;
			vnp_IpAddr: string;
			vnp_CreateDate: string;
			vnp_SecureHash?: string;
			vnp_OrderType: string;
		} = {
			vnp_Version: '2.1.0',
			vnp_Command: 'pay',
			vnp_TmnCode: env.VNPAY_ID,
			vnp_Locale: 'vn',
			vnp_CurrCode: 'VND',
			vnp_TxnRef: NumberUtil.getRandomNumberByLength(8),
			vnp_OrderInfo: String(order.id),
			vnp_Amount: order.totalPrice * 100,
			vnp_ReturnUrl: env.VNPAY_REDIRECT,
			vnp_IpAddr: '::1',
			vnp_CreateDate: DateTimeUtil.formatDateToYYYYMMDDHHMMSS(new Date()),
			vnp_OrderType: 'other'
		};

		vnp_params = ObjectUtil.sortObject(vnp_params);

		const queryString = QueryString.stringify(vnp_params);
		const hmac = createHmac('sha512', env.VNPAY_KEY);
		const secureHash = hmac
			.update(Buffer.from(queryString, 'utf-8'))
			.digest('hex');

		vnp_params.vnp_SecureHash = secureHash;

		const paymentUrl = `${env.VNPAY_URL}?${QueryString.stringify(vnp_params)}`;

		return paymentUrl;
	}

	static async updateOrderStatusToPaid(orderId: number, userId: number) {
		const order = await orderRepository.findOne(
			{
				id: Number(orderId),
				user: {
					id: userId
				}
			},
			{ populate: ['orderItems', 'orderItems.product'] }
		);

		if (!order) {
			throw new GraphQLError('Order not found');
		}

		if (order.status != OrderStatus.CREATED) {
			throw new GraphQLError('Order cant update status');
		}

		order.status = OrderStatus.PAID;

		await orderRepository.save(order);

		return order;
	}

	static async checkOrderSecureHash(input: CheckoutOrderInput) {
		const sorted_vnp_params = ObjectUtil.sortObject(input);
		const vnp_params_clone = ObjectUtil.cloneObject(sorted_vnp_params, [
			'vnp_SecureHash'
		]);
		const vnp_params = QueryString.stringify(
			vnp_params_clone as unknown as Record<string, string | number>
		);

		const hmac = createHmac('sha512', env.VNPAY_KEY);
		const secureHash = hmac
			.update(Buffer.from(vnp_params.replaceAll('%20', '+'), 'utf-8'))
			.digest('hex');

		if (secureHash != input.vnp_SecureHash) {
			throw new GraphQLError('Signature not correct');
		}
	}
}
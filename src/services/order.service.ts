import { createHmac } from 'crypto';
import { GraphQLError } from 'graphql';
import { env } from '~configs/env.config';
import { OrderStatus } from '~constants/order.constant';
import { PaymentProvider } from '~constants/payment.constant';
import { Cart } from '~entities/cart.entity';
import { Order, OrderItem } from '~entities/order.entity';
import { User } from '~entities/user.entity';
import {
	orderItemRepository,
	orderRepository
} from '~repositories/order.repository';
import { CheckoutOrderInput } from '~types/inputs/order.input';
import { DateTimeUtil } from '~utils/datetime.util';
import { NumberUtil } from '~utils/number.util';
import { ObjectUtil } from '~utils/object.util';
import { QueryString } from '~utils/query-string.util';
import { UserLabService } from './user.service';
import { PageInfoArgs, SortOrderArgs } from '~types/args/pagination.arg';
import { PaginationUtil } from '~utils/pagination.util';

export class OrderService {
	static async createOrder(
		user: User,
		orderItems: OrderItem[],
		phone: string,
		address: string,
		paymentProvider: PaymentProvider,
		fullName: string
	) {
		const order = new Order();
		order.user = user;
		order.phone = phone;
		order.address = address;
		order.fullName = fullName;
		order.payment.provider = paymentProvider;
		order.status = OrderStatus.UNPAID;

		orderItems.forEach((orderItem) => order.orderItems.add(orderItem));
		const orderItemsWithLabPrices = orderItems.map((orderItem) => {
			return orderItem.quantity * orderItem.productPrice + orderItem.labPrice;
		});
		order.totalPrice = orderItemsWithLabPrices.reduce(
			(totalValue, itemPrice) => {
				return totalValue + itemPrice;
			},
			0
		);

		return orderRepository.createAndSave(order);
	}

	static async prepareOrderItem(carts: Cart[]) {
		const orderItems: OrderItem[] = [];
		for await (const cart of carts) {
			const orderItem = new OrderItem();
			orderItem.product = cart.product;
			orderItem.quantity = cart.quantity;
			orderItem.productPrice = cart.product.price;

			orderItem.hasLab = cart.hasLab;

			if (cart.hasLab) {
				orderItem.labPrice = cart.product.lab!.price;
			} else {
				orderItem.labPrice = 0;
			}

			orderItems.push(orderItem);
		}
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

		vnp_params = ObjectUtil.sortObjectVNPay(vnp_params);

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
			{
				populate: ['orderItems', 'orderItems.product', 'orderItems.product.lab']
			}
		);

		if (!order) {
			throw new GraphQLError('Order not found');
		}

		if (order.status != OrderStatus.UNPAID) {
			throw new GraphQLError('Order cant update status');
		}

		order.status = OrderStatus.PAID;
		order.payment.time = new Date();

		await orderRepository.save(order);

		return order;
	}

	static async checkOrderSecureHash(input: CheckoutOrderInput) {
		const sorted_vnp_params = ObjectUtil.sortObjectVNPay(input);
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

	static async getOrderByIdAndUserId(orderId: number, userId: number) {
		return orderRepository.findOne(
			{
				id: orderId,
				user: {
					id: userId
				}
			},
			{
				populate: [
					'orderItems',
					'orderItems.userLab',
					'orderItems.product',
					'orderItems.product.images',
					'orderItems.product.lab'
				]
			}
		);
	}

	static async getOrdersBySearch(
		search: string,
		userId: number,
		status?: OrderStatus
	) {
		const statusQuery =
			status != null
				? {
						status: status
					}
				: {};

		let id: number;
		try {
			id = parseInt(atob(atob(atob(atob('search')))), 10);
		} catch {
			id = NaN;
		}

		return orderRepository.find(
			{
				$or: [
					{ id: !isNaN(id) ? id : undefined },
					{
						orderItems: {
							product: {
								name: {
									$like: `%${search}%`
								}
							}
						}
					}
				],
				user: {
					id: userId
				},
				...statusQuery
			},
			{
				populate: [
					'orderItems',
					'orderItems.product',
					'orderItems.product.lab',
					'orderItems.product.images',
					'orderItems.userLab',
					'orderItems.tickets'
				]
			}
		);
	}

	static async getOrdersPagination(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		fields: any,
		pageInfoArgs: PageInfoArgs,
		sortOrderArgs: SortOrderArgs
	) {
		const pageResult = PaginationUtil.avoidTrashInput(pageInfoArgs);
		return orderRepository.findAndCount(
			{},
			{
				fields: fields,
				...pageResult,
				orderBy: {
					[sortOrderArgs.sort]: sortOrderArgs.order
				}
			}
		);
	}

	static async getOrderById(id: number) {
		return orderRepository.findOne(
			{
				id
			},
			{
				populate: ['orderItems', 'orderItems.product']
			}
		);
	}

	static async updateOrder(order: Order) {
		return orderRepository.save(order);
	}

	static async updateOrders(orders: Order[]) {
		return orderRepository.save(orders);
	}

	static async getOrdersByUserId(userId: number) {
		return orderRepository.find({
			user: {
				id: userId
			}
		});
	}

	static async handleOrderStatusBySystem(orders: Order[]) {
		const updatedOrderList: Order[] = [];
		for await (const order of orders) {
			// Auto change status to received: current setting 5 min
			if (order.status == OrderStatus.DELIVERED) {
				if (new Date().getTime() - order.shipTime.getTime() > 1000 * 60 * 5) {
					order.status = OrderStatus.RECEIVED;
					order.receiveTime = new Date();
					updatedOrderList.push(order);

					//create user lab
					for await (const orderItem of order.orderItems) {
						if (orderItem.hasLab) {
							if (!orderItem.product.lab) {
								throw new Error(
									`ProductId: ${orderItem.product.id} don't have lab`
								);
							}
							if (orderItem.userLab) {
								const userLab = orderItem.userLab;
								if (!userLab.isActive) {
									userLab.isActive = true;
									await UserLabService.updateUserLab(userLab);
								}
							}
						}
					}
				}
			}

			//checking for order is expire for rating: current setting 5 min
			if (order.status == OrderStatus.RECEIVED) {
				if (
					new Date().getTime() - order.receiveTime.getTime() >
					1000 * 60 * 5
				) {
					order.status = OrderStatus.UNRATED;
					updatedOrderList.push(order);
				}
			}
		}
		if (updatedOrderList.length > 0) {
			await OrderService.updateOrders(updatedOrderList);
		}
	}
}

export class OrderItemService {
	static async getOrderItemByIdAndUserId(id: number, userId: number) {
		return orderItemRepository.findOne(
			{
				id,
				order: {
					user: {
						id: userId
					}
				}
			},
			{ populate: ['product', 'product.feedbacks'] }
		);
	}
}

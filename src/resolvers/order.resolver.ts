import { GraphQLError } from 'graphql';
import { CountOrderResponse } from 'models/responses/order.model';
import { Arg, Ctx, Int, Mutation, Query, UseMiddleware } from 'type-graphql';
import { OrderStatus } from '~constants/order.constant';
import { PaymentProvider } from '~constants/payment.constant';
import { Cart } from '~entities/cart.entity';
import { Order } from '~entities/order.entity';
import { Product } from '~entities/product.entity';
import { AuthMiddleware } from '~middlewares/auth.middleware';
import { CartService } from '~services/cart.service';
import { OrderService } from '~services/order.service';
import { ProductService } from '~services/product.service';
import { UserService } from '~services/user.service';
import { Context } from '~types/context.type';
import { CheckoutOrderInput } from '~types/inputs/order.input';

export class OrderResolver {
	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Mutation(() => String)
	async createOrder(
		@Ctx() ctx: Context,
		@Arg('cartIds', () => [Int]) cartIds: number[],
		@Arg('phone') phone: string,
		@Arg('address') address: string,
		@Arg('paymentProvider') paymentProvider: PaymentProvider,
		@Arg('fullName') fullName: string
	) {
		const userId = ctx.res.model.data.user.id;

		const user = await UserService.getUserById(userId);

		if (!user) {
			throw new GraphQLError('Something error with this user');
		}

		const carts = await CartService.getCartsByIdsAndUserId(cartIds, userId);
		if (carts.length <= 0) {
			throw new GraphQLError('Cart not found');
		}

		const orderItems = await OrderService.prepareOrderItem(carts);

		const order = await OrderService.createOrder(
			user,
			orderItems,
			phone,
			address,
			paymentProvider,
			fullName
		);

		const VNPayUrl = OrderService.getVNPayURL(order);

		await CartService.removeCarts(carts);

		return VNPayUrl;
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Mutation(() => Boolean)
	async checkoutOrder(
		@Ctx() ctx: Context,
		@Arg('input') input: CheckoutOrderInput
	) {
		const userId = ctx.res.model.data.user.id;

		OrderService.checkOrderSecureHash(input);

		const orderId = Number(input.vnp_OrderInfo);
		const order = await OrderService.updateOrderStatusToPaid(orderId, userId);

		const products: Product[] = [];
		for (const orderItem of order.orderItems) {
			const product = orderItem.product;
			product.sold += 1;
			products.push(product);
		}
		await ProductService.updateProducts(products);

		return true;
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Mutation(() => String)
	async repayOrder(@Ctx() ctx: Context, @Arg('orderId') orderId: number) {
		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('Something error with this user');
		}

		const order = await OrderService.getOrderByIdAndUserId(orderId, userId);
		if (!order) {
			throw new GraphQLError('Order not found');
		}
		if (order.status != OrderStatus.UNPAID) {
			throw new GraphQLError('Order already paid');
		}

		const VNPayUrl = OrderService.getVNPayURL(order);
		return VNPayUrl;
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Query(() => [Order])
	async searchOrder(
		@Ctx() ctx: Context,
		@Arg('search') search: string,
		@Arg('status', { nullable: true }) status?: OrderStatus
	) {
		const userId = ctx.res.model.data.user.id;

		const orders = await OrderService.getOrdersBySearch(search, userId, status);
		const updatedOrderList: Order[] = [];
		for await (const order of orders) {
			// Auto change status to received: current setting 5 min
			if (order.status == OrderStatus.DELIVERED) {
				if (new Date().getTime() - order.shipTime.getTime() > 1000 * 60 * 5) {
					order.status = OrderStatus.RECEIVED;
					order.receiveTime = new Date();

					updatedOrderList.push(order);
				}
			}

			//checking for order is expire for rating: current setting 5 min
			else if (order.status == OrderStatus.RECEIVED) {
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

		return orders;
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Mutation(() => [Cart])
	async reOrder(@Ctx() ctx: Context, @Arg('orderId') orderId: number) {
		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('Something error with this user');
		}

		const order = await OrderService.getOrderByIdAndUserId(orderId, userId);
		if (!order) {
			throw new GraphQLError('Order not found');
		}

		const carts: Cart[] = [];
		for await (const orderItem of order.orderItems) {
			const cart = await CartService.addProductToCart(
				user,
				orderItem.product,
				orderItem.quantity,
				orderItem.hasLab
			);
			carts.push(cart);
		}

		return carts;
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Mutation(() => Order)
	async receiveOrder(@Ctx() ctx: Context, @Arg('orderId') orderId: number) {
		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('Something error with this user');
		}

		const order = await OrderService.getOrderByIdAndUserId(orderId, userId);
		if (!order) {
			throw new GraphQLError('Order not found');
		}
		if (order.status != OrderStatus.DELIVERED) {
			throw new GraphQLError('Order status must be delivered');
		}

		order.status = OrderStatus.RECEIVED;
		order.receiveTime = new Date();

		await OrderService.updateOrder(order);

		return order;
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Query(() => CountOrderResponse)
	async countOrder(@Ctx() ctx: Context) {
		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('Something error with this user');
		}

		const orders = await OrderService.getOrdersByUserId(userId);
		const countOrder = (
			[
				'delivering',
				'delivered',
				'received',
				'unpaid',
				'paid',
				'rated'
			] as OrderStatus[]
		).reduce(
			(acc, status) => {
				acc[status] = 0; // Gán mặc định 0 cho mỗi trạng thái
				return acc;
			},
			{} as Record<OrderStatus, number>
		);

		for (const order of orders) {
			countOrder[order.status]++;
		}

		return countOrder;
	}
}
